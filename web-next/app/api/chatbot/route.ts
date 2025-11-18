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
    const { message, orderNumber, lang = 'en', conversationHistory = [] } = await request.json()

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

    // Check if the last assistant message asked for an order number
    const lastAssistantMessage = conversationHistory
      .filter((msg: any) => msg.role === 'assistant')
      .pop()?.content || ''
    
    const askedForOrderNumber = /(?:order number|número de pedido|pedido|order|tracking)/i.test(lastAssistantMessage) &&
      /(?:provide|proporcionar|dame|give|send)/i.test(lastAssistantMessage)

    // Try to extract order number from message if not provided
    let extractedOrderNumber = orderNumber
    let orderNumberFormatValid = false
    
    if (!extractedOrderNumber) {
      // First, try to match full AVO format (AVO + 9 alphanumeric chars = 12 total)
      const fullOrderNumberMatch = message.match(/\bAVO[-_]?([A-Z0-9]{9})\b/i)
      if (fullOrderNumberMatch) {
        extractedOrderNumber = `AVO${fullOrderNumberMatch[1].toUpperCase()}`
        orderNumberFormatValid = true
      } else if (askedForOrderNumber) {
        // If chatbot asked for order number, treat the entire message as potential order number
        const messageTrimmed = message.trim().toUpperCase()
        
        // If it starts with AVO, use it as-is (might be partial or full)
        if (/^AVO/i.test(messageTrimmed)) {
          extractedOrderNumber = messageTrimmed.replace(/[-_]/, '')
          orderNumberFormatValid = /^AVO[A-Z0-9]{9}$/i.test(extractedOrderNumber)
        } else if (/^[A-Z0-9]{1,15}$/i.test(messageTrimmed)) {
          // If it's just alphanumeric (could be partial order number without AVO prefix)
          // Try prepending AVO and looking it up
          extractedOrderNumber = `AVO${messageTrimmed}`
          orderNumberFormatValid = false // Format will be validated after lookup attempt
        }
      }
    } else {
      orderNumberFormatValid = /^AVO[A-Z0-9]{9}$/i.test(extractedOrderNumber)
    }

    // Get order context if order number is provided
    const orderContext = await getOrderContext(extractedOrderNumber)
    
    // Validate format after lookup attempt
    if (extractedOrderNumber && !orderContext) {
      orderNumberFormatValid = /^AVO[A-Z0-9]{9}$/i.test(extractedOrderNumber)
    }
    
    // Build system context
    const systemContext = getChatbotContext(lang as 'es' | 'en')
    
    let orderInfo = ''
    const orderNumberExample = 'AVO123456789' // Example format (AVO + 9 chars)
    const isSpanish = lang === 'es'
    
    if (orderContext) {
      orderInfo = `\n\nCurrent Order Information (Order ${orderContext.orderNumber}):
- Status: ${orderContext.status}
- Total: ${orderContext.total}${orderContext.currency}
- Created: ${new Date(orderContext.createdAt).toLocaleDateString()}
- Items:
${orderContext.items.map(item => `  - ${item.productName} (${item.quantity}x) - ${item.price}${orderContext.currency}${item.variety ? ` (${item.variety})` : ''}`).join('\n')}

You can provide this order information to the customer.`
    } else if (extractedOrderNumber) {
      // Order number was provided but not found or invalid format
      const formatExample = isSpanish 
        ? `El formato correcto es: ${orderNumberExample} (AVO seguido de 9 caracteres alfanuméricos)`
        : `The correct format is: ${orderNumberExample} (AVO followed by 9 alphanumeric characters)`
      
      if (!orderNumberFormatValid) {
        orderInfo = `\n\nIMPORTANT: The customer provided "${extractedOrderNumber}" which doesn't match the correct order number format. The order number should be exactly 12 characters: AVO followed by 9 alphanumeric characters. ${formatExample}. Please inform them that the order number format is incorrect and provide the example format.`
      } else {
        orderInfo = `\n\nIMPORTANT: The customer provided order number "${extractedOrderNumber}" but it was not found in the system. ${formatExample}. Please inform them that the order number was not found, ask them to verify it (check their confirmation email), and provide the example format.`
      }
    } else if (askedForOrderNumber) {
      // Chatbot asked for order number but user message doesn't contain a valid format
      const formatExample = isSpanish
        ? `El formato del número de pedido es: ${orderNumberExample} (AVO seguido de 9 caracteres alfanuméricos)`
        : `The order number format is: ${orderNumberExample} (AVO followed by 9 alphanumeric characters)`
      
      orderInfo = `\n\nIMPORTANT: You asked for an order number, but the customer's message "${message}" doesn't appear to contain a valid order number format. ${formatExample}. Please ask them again for their order number and provide this example format. Explain that they can find it in their order confirmation email.`
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
  * ONLY ask for their ORDER NUMBER (format: AVO followed by 9 alphanumeric characters, e.g., AVO123456789)
  * Do NOT ask for their name, email, products ordered, or any other information
  * If order information is provided above, share it with the customer immediately
  * If order number format is incorrect or order not found, provide the example format: AVO123456789
  * If no order number is provided, simply ask: "Could you please provide your order number?" (in Spanish: "¿Podrías proporcionarme tu número de pedido?")
- Always respond in ${lang === 'es' ? 'Spanish' : 'English'}
- If you don't know something, admit it and suggest contacting support
- Keep responses concise but informative`

    // Build messages array with conversation history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ]

    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-10)
    recentHistory.forEach((msg: any) => {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role,
          content: msg.content,
        })
      }
    })

    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    })

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
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

