import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getProductById } from '@/lib/products'
import { isVarietyInSeason } from '@/lib/varieties'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { items, country, shippingCost, totalWeight, successUrl, cancelUrl, locale, hasSubscription } = await request.json()
    
    // Ensure locale is a valid type
    const validLocale: 'es' | 'en' = (locale === 'es' || locale === 'en') ? locale : 'en'

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

    // Check for multi-variety orders and season status
    const hasHass = items.some((item: any) => {
      const product = getProductById(item.productId)
      const isBox = product?.category === 'avocados' && product?.type === 'box' && product?.id !== 'subscription'
      return isBox && item.variety === 'hass'
    })
    const hasLambHass = items.some((item: any) => {
      const product = getProductById(item.productId)
      const isBox = product?.category === 'avocados' && product?.type === 'box' && product?.id !== 'subscription'
      return isBox && item.variety === 'lamb-hass'
    })
    const hasMultipleVarieties = hasHass && hasLambHass
    
    // Check season status
    const hassInSeason = hasHass ? isVarietyInSeason('hass') : null
    const lambHassInSeason = hasLambHass ? isVarietyInSeason('lamb-hass') : null
    const hasOutOfSeasonBoxes = (hasHass && !hassInSeason) || (hasLambHass && !lambHassInSeason)

    // Build line items for Stripe
    const lineItems = items.map((item: any) => {
      // Fetch product details from products data
      const product = getProductById(item.productId)
      
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`)
      }

      const price = product.price > 0 ? product.price : 0
      const productTitle = product.title?.[validLocale] || product.title?.en || 'Product'
      
      // Add variety info to description if applicable
      let description = product.description?.[validLocale] || product.description?.en || ''
      if (item.variety) {
        const varietyName = item.variety === 'hass' ? 'Hass' : 'Lamb Hass'
        const isBox = product.category === 'avocados' && product.type === 'box' && product.id !== 'subscription'
        const inSeason = item.variety === 'hass' ? hassInSeason : lambHassInSeason
        
        if (isBox && inSeason !== null && !inSeason) {
          // Add preorder note for out-of-season boxes
          const preorderNote = validLocale === 'es' 
            ? ' (Preorden - Se enviará cuando llegue la temporada)'
            : ' (Preorder - Will ship when season arrives)'
          description = `${description} (${varietyName})${preorderNote}`
        } else {
          description = `${description} (${varietyName})`
        }
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
      const shippingDescription = hasSubscription
        ? (validLocale === 'es' 
            ? `2 envíos a ${country.toUpperCase()} (${totalWeight}kg total)`
            : `2 shipments to ${country.toUpperCase()} (${totalWeight}kg total)`)
        : (validLocale === 'es' 
            ? `Envío a ${country.toUpperCase()} (${totalWeight}kg)`
            : `Shipping to ${country.toUpperCase()} (${totalWeight}kg)`)
      
      finalLineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: validLocale === 'es' ? 'Gastos de envío' : 'Shipping',
            description: shippingDescription,
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      })
    }

    // Calculate total
    const subtotal = items.reduce((sum: number, item: any) => {
      const product = getProductById(item.productId)
      return sum + (product?.price || 0) * item.quantity
    }, 0)
    const total = subtotal + (shippingCost || 0)

    // Create order FIRST (status: pending) before creating Stripe session
    // This ensures we have an orderId to pass to Stripe
    const orderItems = items.map((item: any) => {
      const product = getProductById(item.productId)
      const productTitle = product?.title?.[validLocale] || product?.title?.en || 'Product'
      return {
        productId: item.productId,
        productName: productTitle,
        quantity: item.quantity,
        price: product?.price || 0,
        variety: item.variety || undefined,
      }
    })

    // Create order FIRST (status: pending) before creating Stripe session
    // Use a temporary sessionId that will be replaced
    const tempSessionId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const order = await db.createOrder({
      stripeSessionId: tempSessionId, // Temporary, will be updated after session creation
      customerEmail: undefined, // Will be updated from Stripe
      customerPhone: undefined, // Will be updated from Stripe
      items: orderItems,
      total: total,
      currency: 'eur',
      status: 'pending', // Start as pending, will be updated by webhook or redirect
      completedAt: undefined,
    })

    // Create Stripe Checkout Session with orderId in client_reference_id
    const session = await stripe.checkout.sessions.create({
      client_reference_id: order.id, // Link Stripe session to our order
      payment_method_types: ['card'],
      line_items: finalLineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
      locale: validLocale === 'es' ? 'es' : 'en',
      // Collect shipping address (includes name)
      shipping_address_collection: {
        allowed_countries: ['ES', 'PT', 'FR', 'DE', 'BE', 'DK', 'NL', 'SE', 'FI', 'NO', 'GB'],
      },
      // CRITICAL: Enable phone number collection
      phone_number_collection: {
        enabled: true,
      },
      // Email is collected automatically, but we can be explicit
      customer_email: undefined, // Let Stripe collect it during checkout
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
        // Store multi-shipment and season info
        hasMultipleVarieties: hasMultipleVarieties ? 'true' : 'false',
        hasOutOfSeasonBoxes: hasOutOfSeasonBoxes ? 'true' : 'false',
        hassInSeason: hassInSeason !== null ? (hassInSeason ? 'true' : 'false') : 'null',
        lambHassInSeason: lambHassInSeason !== null ? (lambHassInSeason ? 'true' : 'false') : 'null',
      },
    })

    // Update order with stripeSessionId
    await db.updateOrder(order.id, {
      stripeSessionId: session.id,
    })

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

