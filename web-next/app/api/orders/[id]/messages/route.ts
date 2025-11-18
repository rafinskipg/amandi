import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-middleware'

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
    const { message, isIncident } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify order exists
    const order = await db.getOrder(id)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderMessage = await db.createOrderMessage(
      id,
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
    const messages = await db.getOrderMessages(id)
    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

