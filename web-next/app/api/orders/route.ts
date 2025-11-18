import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    // If sessionId is provided, return single order (for checkout success page)
    if (sessionId) {
      const order = await db.getOrderBySessionId(sessionId)
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ order })
    }

    const status = searchParams.get('status') as any
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = (searchParams.get('sortBy') as 'createdAt' | 'total' | 'status') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    // Use paginated endpoint if search, pagination, or sorting is requested
    if (search || page > 1 || limit !== 20 || sortBy !== 'createdAt' || sortOrder !== 'desc') {
      const result = await db.getOrdersPaginated({
        page,
        limit,
        search,
        status,
        sortBy,
        sortOrder,
      })
      return NextResponse.json(result)
    }

    // Legacy endpoints for backward compatibility
    if (status === 'completed') {
      const orders = await db.getCompletedOrders()
      return NextResponse.json({ orders, total: orders.length, page: 1, totalPages: 1 })
    }

    const orders = await db.getAllOrders()
    return NextResponse.json({ orders, total: orders.length, page: 1, totalPages: 1 })
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

