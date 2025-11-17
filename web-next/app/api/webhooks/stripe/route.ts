import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
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

      const order = db.createOrder({
        stripeSessionId: session.id,
        customerEmail: session.customer_email || session.customer_details?.email,
        items: orderItems,
        total: (session.amount_total || 0) / 100,
        currency: session.currency || 'eur',
        status: 'completed',
        completedAt: new Date(),
      })

      // Track checkout completed event
      db.createEvent({
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

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent succeeded:', paymentIntent.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // Track failed payment
      db.createEvent({
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

// For local testing, you can disable signature verification
// In production, always verify the signature
export const config = {
  api: {
    bodyParser: false,
  },
}

