import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-middleware'

// Get order by ID
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
    const order = await db.getOrder(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// Update order status
export async function PATCH(
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
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'payment_received', 'completed', 'failed', 'delivered']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const order = await db.updateOrder(id, { status: status as any })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    )
  }
}

