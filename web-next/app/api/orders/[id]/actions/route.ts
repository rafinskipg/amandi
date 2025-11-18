import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-middleware'

/**
 * POST - Handle order actions (return, reship, mark as customer contacted)
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
    const { action, description, metadata } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      )
    }

    const order = await db.getOrder(id)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    let statusLog: any

    switch (action) {
      case 'return':
        statusLog = await db.createStatusLog({
          orderId: id,
          status: 'returned',
          description: description || `Order ${order.orderNumber} was returned`,
          metadata: {
            ...metadata,
            returnedAt: new Date().toISOString(),
          },
        })
        // Update order status to failed
        await db.updateOrder(id, {
          status: 'failed',
        })
        break

      case 'reship':
        statusLog = await db.createStatusLog({
          orderId: id,
          status: 'reshipped',
          description: description || `Order ${order.orderNumber} was reshipped`,
          metadata: {
            ...metadata,
            reshippedAt: new Date().toISOString(),
          },
        })
        break

      case 'customer_contacted':
        statusLog = await db.createStatusLog({
          orderId: id,
          status: 'customer_contacted',
          description: description || `Customer was contacted for order ${order.orderNumber}`,
          metadata: {
            ...metadata,
            contactedAt: new Date().toISOString(),
          },
        })
        break

      case 'shipped':
        statusLog = await db.createStatusLog({
          orderId: id,
          status: 'shipped',
          description: description || `Order ${order.orderNumber} was shipped`,
          metadata: {
            ...metadata,
            shippedAt: new Date().toISOString(),
          },
        })
        break

      case 'delivered':
        statusLog = await db.createStatusLog({
          orderId: id,
          status: 'delivered',
          description: description || `Order ${order.orderNumber} was delivered`,
          metadata: {
            ...metadata,
            deliveredAt: new Date().toISOString(),
          },
        })
        await db.updateOrder(id, {
          status: 'delivered',
        })
        break

      default:
        return NextResponse.json(
          { error: `Invalid action. Must be one of: return, reship, customer_contacted, shipped, delivered` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      log: statusLog,
      message: `Order ${action} action completed successfully`
    })
  } catch (error: any) {
    console.error('Error processing order action:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process order action' },
      { status: 500 }
    )
  }
}

