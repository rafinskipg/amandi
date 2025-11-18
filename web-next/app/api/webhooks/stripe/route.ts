import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

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
  
  // Validate webhook secret is configured
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set! Webhook verification will fail.')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  console.log('[Webhook] Body length:', body.length)
  console.log('[Webhook] Has signature:', !!signature)

  if (!signature) {
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
        // Retrieve the session with line items
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ['line_items'],
          }
        )

        const lineItems = sessionWithLineItems.line_items?.data || []

        // Parse items from metadata
        let items: any[] = []
        try {
          if (session.metadata?.items) {
            items = JSON.parse(session.metadata.items)
          }
        } catch (e) {
          console.error('Error parsing items metadata:', e)
        }

        // Create order
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

        // Check if order already exists to prevent duplicates
        const existingOrder = await db.getOrderBySessionId(session.id)
        if (existingOrder) {
          console.log('Order already exists for session:', session.id, 'Order:', existingOrder.orderNumber)
          return NextResponse.json({ received: true, orderId: existingOrder.id })
        }

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
          },
        })

        console.log('Order created:', order.id, 'Order Number:', order.orderNumber)
      } catch (error: any) {
        console.error('Error processing checkout.session.completed:', error)
        // Don't fail the webhook, return success so Stripe doesn't retry
        return NextResponse.json({ 
          received: true, 
          error: error.message,
          warning: 'Order creation failed but webhook processed'
        })
      }
      break
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

  return NextResponse.json({ received: true })
}

// Note: In Next.js App Router, body parsing is handled automatically
// No need for config export - raw body is available via request.text()

