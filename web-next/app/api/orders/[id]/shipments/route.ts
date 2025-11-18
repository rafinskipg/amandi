import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { trackingNumber, carrier, itemIds } = await request.json()

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'Item IDs are required' },
        { status: 400 }
      )
    }

    const shipment = await db.createShipment(
      id,
      trackingNumber,
      carrier,
      itemIds
    )

    return NextResponse.json({ shipment })
  } catch (error: any) {
    console.error('Error creating shipment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create shipment' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const shipments = await db.getShipmentsByOrderId(id)
    return NextResponse.json({ shipments })
  } catch (error: any) {
    console.error('Error fetching shipments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shipments' },
      { status: 500 }
    )
  }
}

