import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// Note: This endpoint is public (used by checkout success page)

/**
 * Endpoint to update order status from redirect page
 * Handles race condition: if webhook already completed the order, don't override it
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Get the order
    const order = await db.getOrderById(id)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // If order is already payment_received or completed (webhook got there first), return success
    if (order.status === 'payment_received' || order.status === 'completed') {
      return NextResponse.json({
        order,
        message: 'Order already processed by webhook'
      })
    }

    // Update stripeSessionId if not set yet or is temporary
    if (!order.stripeSessionId || order.stripeSessionId.startsWith('temp_')) {
      const updatedWithSession = await db.updateOrder(order.id, {
        stripeSessionId: sessionId,
      })
      if (updatedWithSession) {
        return NextResponse.json({
          order: updatedWithSession,
          message: 'Order sessionId updated'
        })
      }
    }

    // Order is pending and sessionId is set - just return it
    // Webhook will update it to completed when it arrives
    // Don't change status here to avoid race conditions
    return NextResponse.json({
      order,
      message: 'Order is pending, waiting for webhook to complete'
    })
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    )
  }
}

