import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, productId, productName, quantity, variety, sessionId, metadata } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    // Validate event type
    const validTypes = ['add_to_cart', 'checkout_started', 'checkout_completed', 'checkout_cancelled']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const event = db.createEvent({
      type,
      productId,
      productName,
      quantity,
      variety,
      sessionId,
      metadata,
    })

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type) {
      const events = db.getEventsByType(type as any)
      return NextResponse.json({ events })
    }

    const events = db.getAllEvents()
    return NextResponse.json({ events })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

