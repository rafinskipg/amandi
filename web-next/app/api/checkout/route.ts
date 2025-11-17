import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getProductById } from '@/lib/products'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { items, country, shippingCost, totalWeight, successUrl, cancelUrl, locale } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    if (!country) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      )
    }

    // Build line items for Stripe
    const lineItems = items.map((item: any) => {
      // Fetch product details from products data
      const product = getProductById(item.productId)
      
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`)
      }

      const price = product.price > 0 ? product.price : 0
      const productTitle = product.title?.[locale] || product.title?.en || 'Product'
      
      // Add variety info to description if applicable
      let description = product.description?.[locale] || product.description?.en || ''
      if (item.variety) {
        const varietyName = item.variety === 'hass' ? 'Hass' : 'Lamb Hass'
        description = `${description} (${varietyName})`
      }

      // Build full image URL if needed
      const imageUrl = product.images && product.images.length > 0 
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${product.images[0]}`
        : undefined

      return {
        price_data: {
          currency: product.currency?.toLowerCase() || 'eur',
          product_data: {
            name: productTitle,
            description: description,
            images: imageUrl ? [imageUrl] : undefined,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }
    })

    // Add shipping as a line item if shipping cost > 0
    const finalLineItems = [...lineItems]
    if (shippingCost && shippingCost > 0) {
      finalLineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: locale === 'es' ? 'Gastos de envío' : 'Shipping',
            description: locale === 'es' 
              ? `Envío a ${country.toUpperCase()} (${totalWeight}kg)`
              : `Shipping to ${country.toUpperCase()} (${totalWeight}kg)`,
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: finalLineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
      locale: locale === 'es' ? 'es' : 'en',
      shipping_address_collection: {
        allowed_countries: ['ES', 'PT', 'FR', 'DE', 'BE', 'DK', 'NL', 'SE', 'FI', 'NO', 'GB'],
      },
      metadata: {
        // Store cart items in metadata for order processing
        items: JSON.stringify(items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          variety: item.variety || null,
        }))),
        // Store shipping info
        country: country,
        shippingCost: shippingCost?.toString() || '0',
        totalWeight: totalWeight?.toString() || '0',
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

