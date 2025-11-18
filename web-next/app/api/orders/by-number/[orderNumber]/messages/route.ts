import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        const { orderNumber } = await params
        const { message, isIncident } = await request.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        // Find order by order number
        const order = await db.getOrderByOrderNumber(orderNumber.toUpperCase())
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        const orderMessage = await db.createOrderMessage(
            order.id,
            message,
            isIncident === true,
            true // fromCustomer
        )

        return NextResponse.json({ message: orderMessage })
    } catch (error: any) {
        console.error('Error creating order message:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create message' },
            { status: 500 }
        )
    }
}

