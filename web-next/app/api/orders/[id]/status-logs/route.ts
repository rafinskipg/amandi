import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-middleware'

/**
 * GET - Get status logs for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authError = await requireAdminAuth(request)
  if (authError) {
    return authError
  }

  try {
    const { id } = await params
    const logs = await db.getStatusLogsByOrderId(id)
    return NextResponse.json({ logs })
  } catch (error: any) {
    console.error('Error fetching status logs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status logs' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new status log
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authError = await requireAdminAuth(request)
  if (authError) {
    return authError
  }

  try {
    const { id } = await params
    const { status, description, metadata } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['created', 'payment_confirmed', 'shipped', 'customer_contacted', 'reshipped', 'returned', 'delivered']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const log = await db.createStatusLog({
      orderId: id,
      status: status as any,
      description,
      metadata,
    })

    // If status is 'shipped' or 'reshipped', also update order status if needed
    if (status === 'shipped' || status === 'reshipped') {
      const order = await db.getOrder(id)
      if (order && order.status !== 'delivered') {
        // Don't change order status, just log the shipment
      }
    }

    // If status is 'returned', update order status
    if (status === 'returned') {
      await db.updateOrder(id, {
        status: 'failed', // Or create a new status 'returned' if needed
      })
    }

    return NextResponse.json({ log })
  } catch (error: any) {
    console.error('Error creating status log:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create status log' },
      { status: 500 }
    )
  }
}

