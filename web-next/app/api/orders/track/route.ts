import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public endpoint to track orders by order number (no personal info exposed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      )
    }

    const order = await db.getOrderByOrderNumber(orderNumber.toUpperCase())

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get shipments and messages for this order
    const shipments = await db.getShipmentsByOrderId(order.id)
    const messages = await db.getOrderMessages(order.id)

    // Return order info WITHOUT personal information
    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        variety: item.variety,
        shipped: item.shipped,
        shippedAt: item.shippedAt,
      })),
      shipments: shipments.map(shipment => ({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        shippedAt: shipment.shippedAt,
        createdAt: shipment.createdAt,
        itemsCount: shipment.items.length,
      })),
      messages: messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        isIncident: msg.isIncident,
        fromCustomer: msg.fromCustomer,
        createdAt: msg.createdAt,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

