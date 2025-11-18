import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getChatbotContext, calculateShippingForChatbot } from '@/lib/chatbot-context'
import { getProductById, products } from '@/lib/products'
import { db } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to extract order information
async function getOrderContext(orderNumber?: string) {
  if (!orderNumber) return null

  try {
    const order = await db.getOrderByOrderNumber(orderNumber.toUpperCase())
    if (!order) return null

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        variety: item.variety,
      })),
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, orderNumber, lang = 'en' } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Try to extract order number from message if not provided
    let extractedOrderNumber = orderNumber
    if (!extractedOrderNumber) {
      // Look for order number patterns (format: AVO + 9 alphanumeric chars, e.g., AVO123456789)
      // Handle variations like "AVO-123456789" or "AVO123456789"
      const orderNumberMatch = message.match(/\bAVO[-_]?([A-Z0-9]{9})\b/i)
      if (orderNumberMatch) {
        extractedOrderNumber = `AVO${orderNumberMatch[1].toUpperCase()}`
      }
    }

    // Get order context if order number is provided
    const orderContext = await getOrderContext(extractedOrderNumber)
    
    // Build system context
    const systemContext = getChatbotContext(lang as 'es' | 'en')
    
    let orderInfo = ''
    if (orderContext) {
      orderInfo = `\n\nCurrent Order Information (Order ${orderContext.orderNumber}):
- Status: ${orderContext.status}
- Total: ${orderContext.total}${orderContext.currency}
- Created: ${new Date(orderContext.createdAt).toLocaleDateString()}
- Items:
${orderContext.items.map(item => `  - ${item.productName} (${item.quantity}x) - ${item.price}${orderContext.currency}${item.variety ? ` (${item.variety})` : ''}`).join('\n')}

You can provide this order information to the customer.`
    } else if (extractedOrderNumber) {
      orderInfo = `\n\nNote: The customer mentioned order number "${extractedOrderNumber}" but it was not found in the system. Inform them that the order number was not found and ask them to verify the order number.`
    }

    // Check if user is asking about shipping costs - extract country and weight if mentioned
    const shippingMatch = message.match(/(?:shipping|envío|envio|delivery|entrega).*?(?:to|a|para|in|en)?\s*([a-z]{2}|spain|españa|portugal|france|francia|germany|alemania|belgium|bélgica|denmark|dinamarca|netherlands|holanda|sweden|suecia|finland|finlandia|norway|noruega|uk|reino unido|gb)/i)
    let shippingCalculation = ''
    
    if (shippingMatch) {
      // Try to extract country code
      const countryMention = shippingMatch[1]?.toLowerCase()
      const countryMap: Record<string, string> = {
        'spain': 'es', 'españa': 'es',
        'portugal': 'pt',
        'france': 'fr', 'francia': 'fr',
        'germany': 'de', 'alemania': 'de',
        'belgium': 'be', 'bélgica': 'be',
        'denmark': 'dk', 'dinamarca': 'dk',
        'netherlands': 'nl', 'holanda': 'nl',
        'sweden': 'se', 'suecia': 'se',
        'finland': 'fi', 'finlandia': 'fi',
        'norway': 'no', 'noruega': 'no',
        'uk': 'gb', 'reino unido': 'gb', 'gb': 'gb',
      }
      
      const countryCode = countryMap[countryMention] || countryMention
      
      // Try to extract weight
      const weightMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?|kilos?)/i)
      const weight = weightMatch ? parseFloat(weightMatch[1]) : null
      
      // Try to extract subtotal for free shipping check
      const subtotalMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:€|eur|euros?)/i)
      const subtotal = subtotalMatch ? parseFloat(subtotalMatch[1]) : 0
      
      if (countryCode && weight) {
        const shippingResult = calculateShippingForChatbot(countryCode, weight, subtotal)
        shippingCalculation = `\n\nShipping Calculation for ${countryCode.toUpperCase()} (${weight}kg${subtotal > 0 ? `, subtotal ${subtotal}€` : ''}):\n${shippingResult.info}`
      } else if (countryCode) {
        // Just country mentioned, provide general info
        const shippingResult = calculateShippingForChatbot(countryCode, 1, 0)
        shippingCalculation = `\n\nShipping Information for ${countryCode.toUpperCase()}:\n${shippingResult.info}\n\nNote: To calculate exact shipping, I need the total weight of your order.`
      }
    }

    // Build system prompt
    const systemPrompt = `You are a helpful customer service assistant for Avocados Amandi, an organic avocado farm in Asturias, Spain. You help customers with questions about products, orders, shipping, and the farm.

${systemContext}${orderInfo}${shippingCalculation}

Instructions:
- Be friendly, helpful, and conversational
- Answer questions about products, pricing, shipping costs, and the farm
- When calculating shipping costs, use the provided shipping calculation function results if available
- If a customer asks about shipping but doesn't specify country/weight, ask them for these details
- IMPORTANT - Order Tracking: When a customer asks about finding their order, tracking their order, or checking order status:
  * ONLY ask for their ORDER NUMBER (format: AVO followed by 9 characters, e.g., AVO123456789)
  * Do NOT ask for their name, email, products ordered, or any other information
  * If order information is provided above, share it with the customer
  * If no order number is provided, simply ask: "Could you please provide your order number?" (in Spanish: "¿Podrías proporcionarme tu número de pedido?")
- Always respond in ${lang === 'es' ? 'Spanish' : 'English'}
- If you don't know something, admit it and suggest contacting support
- Keep responses concise but informative`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Track chatbot usage event
    try {
      await db.createEvent({
        type: 'chatbot_used',
        metadata: {
          message: message.substring(0, 200), // Truncate for storage
          orderNumber: orderNumber || null,
          lang,
        },
      })
    } catch (error) {
      console.error('Error tracking chatbot event:', error)
      // Don't fail the request if event tracking fails
    }

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Error in chatbot API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

