import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-middleware'

/**
 * GET - Get delivery sticker data for an order
 * Returns order info, shipping address, tracking number, etc. for sticker generation
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
    const order = await db.getOrder(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get latest shipment with tracking number
    const shipments = await db.getShipmentsByOrderId(id)
    const latestShipment = shipments.length > 0 ? shipments[shipments.length - 1] : null

    // Build shipping address
    const shippingAddress = {
      name: order.shippingName || '',
      line1: order.shippingLine1 || '',
      line2: order.shippingLine2 || '',
      city: order.shippingCity || '',
      state: order.shippingState || '',
      postalCode: order.shippingPostalCode || '',
      country: order.shippingCountry || '',
    }

    // Build full address string
    const addressParts = [
      shippingAddress.line1,
      shippingAddress.line2,
      `${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ''} ${shippingAddress.postalCode}`,
      shippingAddress.country,
    ].filter(Boolean)

    const fullAddress = addressParts.join('\n')

    // Generate tracking URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.amandi.bio'
    const trackingUrl = `${baseUrl}/track/${order.orderNumber}`

    return NextResponse.json({
      orderNumber: order.orderNumber,
      shippingName: shippingAddress.name,
      shippingAddress: fullAddress,
      trackingNumber: latestShipment?.trackingNumber || null,
      carrier: latestShipment?.carrier || null,
      trackingUrl,
      qrCodeData: trackingUrl, // URL to encode in QR code
      orderDate: order.createdAt,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        variety: item.variety,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching delivery sticker data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch delivery sticker data' },
      { status: 500 }
    )
  }
}

