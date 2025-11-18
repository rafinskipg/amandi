import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

// Configure runtime - important for webhooks to avoid redirects
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

// Stripe webhook secret - in production, get this from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  // Log webhook request for debugging
  console.log('[Webhook] Received POST request')
  console.log('[Webhook] URL:', request.url)
  console.log('[Webhook] Method:', request.method)
  console.log('[Webhook] Headers:', {
    'content-type': request.headers.get('content-type'),
    'stripe-signature': request.headers.get('stripe-signature') ? 'present' : 'missing',
  })

  // Validate webhook secret is configured
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set! Webhook verification will fail.')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get raw body as text (important for signature verification)
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('[Webhook] Body length:', body.length)
  console.log('[Webhook] Has signature:', !!signature)

  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header')
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
    console.log('[Webhook] Event verified:', event.type, event.id)
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      try {
        // WEBHOOK HAS PRIORITY - Find order by client_reference_id first (orderId)
        // Then fallback to sessionId if client_reference_id not available
        let existingOrder = null

        if (session.client_reference_id) {
          console.log('[Webhook] Looking for order by client_reference_id:', session.client_reference_id)
          existingOrder = await db.getOrderById(session.client_reference_id)
          if (existingOrder) {
            console.log('[Webhook] ✓ Found order by client_reference_id:', existingOrder.orderNumber)
          } else {
            console.log('[Webhook] ✗ Order not found by client_reference_id:', session.client_reference_id)
          }
        }

        // Fallback to sessionId lookup
        if (!existingOrder) {
          console.log('[Webhook] Looking for order by sessionId:', session.id)
          existingOrder = await db.getOrderBySessionId(session.id)
          if (existingOrder) {
            console.log('[Webhook] ✓ Found order by sessionId:', existingOrder.orderNumber)
          } else {
            console.log('[Webhook] ✗ Order not found by sessionId:', session.id)
          }
        }

        // If order exists, update it to completed (webhook has priority)
        if (existingOrder) {
          // Extract shipping address from Stripe session
          // Stripe stores shipping info in collected_information.shipping_details or customer_details
          const shippingInfo = (session as any).collected_information?.shipping_details || (session as any).shipping_details
          const shippingAddress = shippingInfo?.address || session.customer_details?.address
          const shippingName = shippingInfo?.name || session.customer_details?.name

          // Update order status to completed and add customer info + shipping address
          const updatedOrder = await db.updateOrder(existingOrder.id, {
            status: 'completed',
            completedAt: new Date(),
            customerEmail: session.customer_email || session.customer_details?.email || existingOrder.customerEmail,
            customerPhone: session.customer_details?.phone || existingOrder.customerPhone,
            stripeSessionId: session.id, // Ensure sessionId is set
            shippingName: shippingName || existingOrder.shippingName,
            shippingLine1: shippingAddress?.line1 || existingOrder.shippingLine1,
            shippingLine2: shippingAddress?.line2 || existingOrder.shippingLine2,
            shippingCity: shippingAddress?.city || existingOrder.shippingCity,
            shippingState: shippingAddress?.state || existingOrder.shippingState,
            shippingPostalCode: shippingAddress?.postal_code || existingOrder.shippingPostalCode,
            shippingCountry: shippingAddress?.country || existingOrder.shippingCountry,
          })

          // Create status log for payment confirmation
          if (existingOrder.status !== 'completed') {
            await db.createStatusLog({
              orderId: updatedOrder!.id,
              status: 'payment_confirmed',
              description: `Payment confirmed for order ${updatedOrder!.orderNumber}`,
              metadata: {
                sessionId: session.id,
                amount: updatedOrder!.total,
                currency: updatedOrder!.currency,
              },
            })
          }

          // Track checkout completed event
          await db.createEvent({
            type: 'checkout_completed',
            sessionId: session.id,
            metadata: {
              orderId: updatedOrder!.id,
              orderNumber: updatedOrder!.orderNumber,
              total: updatedOrder!.total,
              webhookPriority: true,
            },
          })

          console.log('[Webhook] Order updated to completed:', updatedOrder!.id, 'Order Number:', updatedOrder!.orderNumber)
          return NextResponse.json({
            received: true,
            orderId: updatedOrder!.id,
            orderNumber: updatedOrder!.orderNumber,
            message: 'Order updated to completed'
          })
        }

        // If order doesn't exist (shouldn't happen with new flow, but handle gracefully)
        console.warn('[Webhook] Order not found for session:', session.id, 'client_reference_id:', session.client_reference_id)
        console.warn('[Webhook] This should not happen with the new flow. Creating order as fallback...')

        // Retrieve the session with line items to create order
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ['line_items'],
          }
        )

        const lineItems = sessionWithLineItems.line_items?.data || []
        console.log('[Webhook] Retrieved', lineItems.length, 'line items from Stripe')

        // Parse items from metadata
        let items: any[] = []
        try {
          if (session.metadata?.items) {
            items = JSON.parse(session.metadata.items)
            console.log('[Webhook] Parsed', items.length, 'items from metadata')
          } else {
            console.warn('[Webhook] No items in metadata!')
          }
        } catch (e) {
          console.error('[Webhook] Error parsing items metadata:', e)
        }

        // Map lineItems to orderItems, filtering out shipping
        // Match by productId from metadata instead of using index
        const orderItems = lineItems
          .map((lineItem) => {
            // Try to find matching metadata item by productId
            // Check if lineItem has product metadata or match by description
            const lineItemProductId = (lineItem as any).price?.product || lineItem.description

            // Find matching metadata item
            const metadataItem = items.find((item: any) => {
              // Try to match by productId or by checking if this is a product line item
              return item.productId && lineItem.description &&
                (lineItem.description.toLowerCase().includes(item.productId.toLowerCase()) ||
                  lineItemProductId === item.productId)
            })

            // Skip if no metadata item found (likely shipping or other non-product item)
            if (!metadataItem || !metadataItem.productId) {
              // Check if this is clearly a shipping item
              if (lineItem.description?.toLowerCase().includes('shipping') ||
                lineItem.description?.toLowerCase().includes('delivery') ||
                lineItem.description?.toLowerCase().includes('envío')) {
                return null
              }
              // If we have items in metadata but this doesn't match, skip it
              if (items.length > 0) {
                return null
              }
            }

            return {
              productId: metadataItem?.productId || 'unknown',
              productName: lineItem.description || 'Unknown Product',
              quantity: lineItem.quantity || 1,
              price: (lineItem.price?.unit_amount || 0) / 100,
              variety: metadataItem?.variety || undefined,
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null && item.productId !== 'unknown')

        console.log('[Webhook] Mapped', orderItems.length, 'order items from', lineItems.length, 'line items')

        if (orderItems.length === 0) {
          console.error('[Webhook] No valid order items found! Cannot create order.')
          throw new Error('No valid order items found in webhook payload')
        }

        // Create order as fallback (shouldn't happen with new flow)
        console.log('[Webhook] Creating order with', orderItems.length, 'items, total:', (session.amount_total || 0) / 100)
        const order = await db.createOrder({
          stripeSessionId: session.id,
          customerEmail: session.customer_email || session.customer_details?.email || undefined,
          customerPhone: session.customer_details?.phone || undefined,
          items: orderItems,
          total: (session.amount_total || 0) / 100,
          currency: session.currency || 'eur',
          status: 'completed',
          completedAt: new Date(),
        })

        // Track checkout completed event
        await db.createEvent({
          type: 'checkout_completed',
          sessionId: session.id,
          metadata: {
            orderId: order.id,
            total: order.total,
            fallbackCreation: true,
          },
        })

        console.log('[Webhook] Order created (fallback):', order.id, 'Order Number:', order.orderNumber)
        return NextResponse.json({
          received: true,
          orderId: order.id,
          orderNumber: order.orderNumber,
          warning: 'Order created as fallback (should not happen with new flow)'
        })
      } catch (error: any) {
        console.error('[Webhook] Error processing checkout.session.completed:', error)
        // Return success with error details so Stripe doesn't retry infinitely
        // But log the error for debugging
        return NextResponse.json(
          {
            received: true,
            error: error.message,
            warning: 'Order processing failed but webhook processed'
          },
          { status: 200 } // Return 200 so Stripe doesn't retry
        )
      }
    }

    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session

      // Find existing order by session ID
      const existingOrder = await db.getOrderBySessionId(session.id)

      if (existingOrder) {
        // Update order status to completed
        await db.updateOrder(existingOrder.id, {
          status: 'completed',
          completedAt: new Date(),
        })

        // Track async payment succeeded event
        await db.createEvent({
          type: 'checkout_completed',
          sessionId: session.id,
          metadata: {
            orderId: existingOrder.id,
            asyncPayment: true,
          },
        })

        console.log('Async payment succeeded, order updated:', existingOrder.id)
      } else {
        // If order doesn't exist, create it (similar to completed handler)
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          { expand: ['line_items'] }
        )

        const lineItems = sessionWithLineItems.line_items?.data || []
        let items: any[] = []
        try {
          if (session.metadata?.items) {
            items = JSON.parse(session.metadata.items)
          }
        } catch (e) {
          console.error('Error parsing items metadata:', e)
        }

        const orderItems = lineItems.map((item, index) => {
          const metadataItem = items[index]
          return {
            productId: metadataItem?.productId || 'unknown',
            productName: item.description || 'Unknown Product',
            quantity: item.quantity || 1,
            price: (item.price?.unit_amount || 0) / 100,
            variety: metadataItem?.variety || undefined,
          }
        })

        const order = await db.createOrder({
          stripeSessionId: session.id,
          customerEmail: session.customer_email || session.customer_details?.email || undefined,
          customerPhone: session.customer_details?.phone || undefined,
          items: orderItems,
          total: (session.amount_total || 0) / 100,
          currency: session.currency || 'eur',
          status: 'completed',
          completedAt: new Date(),
        })

        await db.createEvent({
          type: 'checkout_completed',
          sessionId: session.id,
          metadata: {
            orderId: order.id,
            asyncPayment: true,
          },
        })

        console.log('Order created from async payment:', order.id)
      }
      break
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Find existing order by session ID
      const existingOrder = await db.getOrderBySessionId(session.id)

      if (existingOrder) {
        // Update order status to failed
        await db.updateOrder(existingOrder.id, {
          status: 'failed',
        })
      }

      // Track async payment failed event
      await db.createEvent({
        type: 'checkout_cancelled',
        sessionId: session.id,
        metadata: {
          error: 'Async payment failed',
          orderId: existingOrder?.id,
        },
      })

      console.log('Async payment failed for session:', session.id)
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session

      // Find existing order by session ID
      const existingOrder = await db.getOrderBySessionId(session.id)

      if (existingOrder && existingOrder.status === 'pending') {
        // Update order status to failed if it was pending
        await db.updateOrder(existingOrder.id, {
          status: 'failed',
        })
      }

      // Track expired session event
      await db.createEvent({
        type: 'checkout_cancelled',
        sessionId: session.id,
        metadata: {
          reason: 'Session expired',
          orderId: existingOrder?.id,
        },
      })

      console.log('Checkout session expired:', session.id)
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent succeeded:', paymentIntent.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Track failed payment
      await db.createEvent({
        type: 'checkout_cancelled',
        sessionId: paymentIntent.id,
        metadata: {
          error: paymentIntent.last_payment_error?.message,
        },
      })

      console.log('PaymentIntent failed:', paymentIntent.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Always return 200 OK to Stripe
  return NextResponse.json(
    { received: true },
    { status: 200 }
  )
}

// Note: In Next.js App Router, body parsing is handled automatically
// No need for config export - raw body is available via request.text()

