import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

// Stripe webhook secret - in production, get this from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

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
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

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

      console.log('Order created:', order.id)
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

