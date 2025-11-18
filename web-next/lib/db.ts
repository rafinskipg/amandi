// PostgreSQL database using Prisma
import { prisma } from './prisma'
import type { OrderStatus, EventType } from '@prisma/client'

export interface Order {
  id: string
  orderNumber: string
  stripeSessionId: string
  customerEmail?: string
  customerPhone?: string
  // Shipping address
  shippingName?: string
  shippingLine1?: string
  shippingLine2?: string
  shippingCity?: string
  shippingState?: string
  shippingPostalCode?: string
  shippingCountry?: string
  items: OrderItem[]
  total: number
  currency: string
  status: 'pending' | 'payment_received' | 'completed' | 'failed' | 'delivered'
  createdAt: Date
  completedAt?: Date
}

// Generate a human-readable order number (e.g., AVO123XHFA21)
function generateOrderNumber(): string {
  const prefix = 'AVO'
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6) // Last 6 chars of base36 timestamp
  const random = Math.random().toString(36).toUpperCase().slice(2, 5) // 3 random chars
  return `${prefix}${timestamp}${random}`
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  variety?: string
  shipped?: boolean
  shippedAt?: Date
  shipmentId?: string
}

// Type for creating order items (without id, shipped, shippedAt, shipmentId)
export type CreateOrderItem = Omit<OrderItem, 'id' | 'shipped' | 'shippedAt' | 'shipmentId'>

export interface Shipment {
  id: string
  orderId: string
  trackingNumber?: string
  carrier?: string
  shippedAt?: Date
  createdAt: Date
  items: OrderItem[]
}

export interface OrderMessage {
  id: string
  orderId: string
  message: string
  isIncident: boolean
  fromCustomer: boolean
  createdAt: Date
}

export interface Event {
  id: string
  type: 'add_to_cart' | 'checkout_started' | 'checkout_completed' | 'checkout_cancelled' | 'chatbot_used'
  productId?: string
  productName?: string
  quantity?: number
  variety?: string
  sessionId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface OrderStatusLog {
  id: string
  orderId: string
  status: 'created' | 'payment_confirmed' | 'shipped' | 'customer_contacted' | 'reshipped' | 'returned' | 'delivered'
  description?: string
  metadata?: Record<string, any>
  createdAt: Date
}

// Helper function to map Prisma Order to our Order interface
function mapPrismaOrderToOrder(order: any): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    stripeSessionId: order.stripeSessionId,
    customerEmail: order.customerEmail || undefined,
    customerPhone: order.customerPhone || undefined,
    shippingName: order.shippingName || undefined,
    shippingLine1: order.shippingLine1 || undefined,
    shippingLine2: order.shippingLine2 || undefined,
    shippingCity: order.shippingCity || undefined,
    shippingState: order.shippingState || undefined,
    shippingPostalCode: order.shippingPostalCode || undefined,
    shippingCountry: order.shippingCountry || undefined,
    total: order.total,
    currency: order.currency,
    status: order.status as Order['status'],
    createdAt: order.createdAt,
    completedAt: order.completedAt || undefined,
    items: order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      variety: item.variety || undefined,
      shipped: item.shipped,
      shippedAt: item.shippedAt || undefined,
      shipmentId: item.shipmentId || undefined,
    })),
  }
}

// Database API
export const db = {
  // Orders
  createOrder: async (order: Omit<Order, 'id' | 'createdAt' | 'orderNumber' | 'items'> & { items: CreateOrderItem[] }): Promise<Order> => {
    // Generate unique order number
    let orderNumber = generateOrderNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.order.findUnique({ where: { orderNumber } })
      if (!existing) break
      orderNumber = generateOrderNumber()
      attempts++
    }

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        stripeSessionId: order.stripeSessionId,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingName: order.shippingName,
        shippingLine1: order.shippingLine1,
        shippingLine2: order.shippingLine2,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingPostalCode: order.shippingPostalCode,
        shippingCountry: order.shippingCountry,
        total: order.total,
        currency: order.currency,
        status: order.status as OrderStatus,
        completedAt: order.completedAt,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            variety: item.variety,
          })),
        },
      },
      include: {
        items: true,
      },
    })

      const mappedOrder = mapPrismaOrderToOrder(createdOrder)
      
      // Create initial status log
      await db.createStatusLog({
        orderId: mappedOrder.id,
        status: 'created',
        description: `Order ${mappedOrder.orderNumber} was created`,
      })
      
      return mappedOrder
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<Order | null> => {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          ...(updates.status && { status: updates.status as OrderStatus }),
          ...(updates.completedAt !== undefined && { completedAt: updates.completedAt }),
          ...(updates.customerEmail !== undefined && { customerEmail: updates.customerEmail }),
          ...(updates.customerPhone !== undefined && { customerPhone: updates.customerPhone }),
          ...(updates.stripeSessionId !== undefined && { stripeSessionId: updates.stripeSessionId }),
          ...(updates.shippingName !== undefined && { shippingName: updates.shippingName }),
          ...(updates.shippingLine1 !== undefined && { shippingLine1: updates.shippingLine1 }),
          ...(updates.shippingLine2 !== undefined && { shippingLine2: updates.shippingLine2 }),
          ...(updates.shippingCity !== undefined && { shippingCity: updates.shippingCity }),
          ...(updates.shippingState !== undefined && { shippingState: updates.shippingState }),
          ...(updates.shippingPostalCode !== undefined && { shippingPostalCode: updates.shippingPostalCode }),
          ...(updates.shippingCountry !== undefined && { shippingCountry: updates.shippingCountry }),
        },
        include: {
          items: true,
        },
      })

      return mapPrismaOrderToOrder(updatedOrder)
    } catch (error) {
      return null
    }
  },

  // Update order by stripeSessionId (for race condition handling)
  updateOrderBySessionId: async (sessionId: string, updates: Partial<Order>): Promise<Order | null> => {
    try {
      const updatedOrder = await prisma.order.update({
        where: { stripeSessionId: sessionId },
        data: {
          ...(updates.status && { status: updates.status as OrderStatus }),
          ...(updates.completedAt !== undefined && { completedAt: updates.completedAt }),
          ...(updates.customerEmail !== undefined && { customerEmail: updates.customerEmail }),
          ...(updates.customerPhone !== undefined && { customerPhone: updates.customerPhone }),
        },
        include: {
          items: true,
        },
      })

      return mapPrismaOrderToOrder(updatedOrder)
    } catch (error) {
      return null
    }
  },

  getOrder: async (id: string): Promise<Order | null> => {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      })

      if (!order) return null
      return mapPrismaOrderToOrder(order)
    } catch (error) {
      return null
    }
  },

  getOrderByOrderNumber: async (orderNumber: string): Promise<Order | null> => {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
        },
      })

      if (!order) return null
      return mapPrismaOrderToOrder(order)
    } catch (error) {
      return null
    }
  },

  getOrderBySessionId: async (sessionId: string): Promise<Order | null> => {
    try {
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          items: true,
        },
      })

      if (!order) return null
      return mapPrismaOrderToOrder(order)
    } catch (error) {
      return null
    }
  },

  // Get order by ID (for client_reference_id lookup)
  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      })

      if (!order) return null

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        stripeSessionId: order.stripeSessionId,
        customerEmail: order.customerEmail || undefined,
        customerPhone: order.customerPhone || undefined,
        total: order.total,
        currency: order.currency,
        status: order.status as Order['status'],
        createdAt: order.createdAt,
        completedAt: order.completedAt || undefined,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          variety: item.variety || undefined,
          shipped: item.shipped,
          shippedAt: item.shippedAt || undefined,
          shipmentId: item.shipmentId || undefined,
        })),
      }
    } catch (error) {
      return null
    }
  },

  getAllOrders: async (): Promise<Order[]> => {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return orders.map(order => mapPrismaOrderToOrder(order))
  },

  getCompletedOrders: async (): Promise<Order[]> => {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['payment_received', 'completed'] },
      },
      include: {
        items: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    return orders.map(order => mapPrismaOrderToOrder(order))
  },

  // Get orders with pagination, search, and sorting
  getOrdersPaginated: async (options: {
    page?: number
    limit?: number
    search?: string
    status?: Order['status']
    sortBy?: 'createdAt' | 'total' | 'status'
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> => {
    const page = options.page || 1
    const limit = options.limit || 20
    const skip = (page - 1) * limit
    const search = options.search?.toLowerCase().trim()
    const status = options.status
    const sortBy = options.sortBy || 'createdAt'
    const sortOrder = options.sortOrder || 'desc'

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { stripeSessionId: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'total') {
      orderBy.total = sortOrder
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders: orders.map(order => mapPrismaOrderToOrder(order)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  },

  // Events
  createEvent: async (event: Omit<Event, 'id' | 'timestamp'>): Promise<Event> => {
    const createdEvent = await prisma.event.create({
      data: {
        type: event.type as EventType,
        productId: event.productId,
        productName: event.productName,
        quantity: event.quantity,
        variety: event.variety,
        sessionId: event.sessionId,
        metadata: event.metadata || {},
      },
    })

    return {
      id: createdEvent.id,
      type: createdEvent.type as Event['type'],
      productId: createdEvent.productId || undefined,
      productName: createdEvent.productName || undefined,
      quantity: createdEvent.quantity || undefined,
      variety: createdEvent.variety || undefined,
      sessionId: createdEvent.sessionId || undefined,
      timestamp: createdEvent.timestamp,
      metadata: createdEvent.metadata as Record<string, any> | undefined,
    }
  },

  getAllEvents: async (): Promise<Event[]> => {
    const events = await prisma.event.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    })

    return events.map(event => ({
      id: event.id,
      type: event.type as Event['type'],
      productId: event.productId || undefined,
      productName: event.productName || undefined,
      quantity: event.quantity || undefined,
      variety: event.variety || undefined,
      sessionId: event.sessionId || undefined,
      timestamp: event.timestamp,
      metadata: event.metadata as Record<string, any> | undefined,
    }))
  },

  getEventsByType: async (type: Event['type']): Promise<Event[]> => {
    const events = await prisma.event.findMany({
      where: {
        type: type as EventType,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return events.map(event => ({
      id: event.id,
      type: event.type as Event['type'],
      productId: event.productId || undefined,
      productName: event.productName || undefined,
      quantity: event.quantity || undefined,
      variety: event.variety || undefined,
      sessionId: event.sessionId || undefined,
      timestamp: event.timestamp,
      metadata: event.metadata as Record<string, any> | undefined,
    }))
  },

  // Metrics
  getMetrics: async () => {
    // Use counts and aggregations instead of loading all data
    const [
      totalOrders,
      completedOrdersCount,
      totalRevenueResult,
      addToCartCount,
      checkoutStarted,
      checkoutCompleted,
      checkoutCancelled,
      chatbotUsed,
      addToCartEvents,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['payment_received', 'completed'] } } }),
      prisma.order.aggregate({
        where: { 
          status: { in: ['payment_received', 'completed', 'delivered'] } // Count payment_received, completed and delivered orders for revenue
        },
        _sum: { total: true },
      }),
      prisma.event.count({ where: { type: 'add_to_cart' } }),
      prisma.event.count({ where: { type: 'checkout_started' } }),
      prisma.event.count({ where: { type: 'checkout_completed' } }),
      prisma.event.count({ where: { type: 'checkout_cancelled' } }),
      prisma.event.count({ where: { type: 'chatbot_used' } }),
      // Only fetch add_to_cart events for product stats (limit to recent ones if needed)
      prisma.event.findMany({
        where: { type: 'add_to_cart' },
        select: {
          productId: true,
          productName: true,
          quantity: true,
        },
        take: 10000, // Limit to prevent memory issues
      }),
    ])

    const totalRevenue = totalRevenueResult._sum.total || 0

    // Calculate product stats from fetched events
    const productStats = addToCartEvents.reduce((acc, event) => {
      if (event.productId) {
        if (!acc[event.productId]) {
          acc[event.productId] = {
            productId: event.productId,
            productName: event.productName || 'Unknown',
            addToCartCount: 0,
            totalQuantity: 0,
          }
        }
        acc[event.productId].addToCartCount++
        acc[event.productId].totalQuantity += event.quantity || 0
      }
      return acc
    }, {} as Record<string, { productId: string; productName: string; addToCartCount: number; totalQuantity: number }>)

    return {
      totalOrders,
      completedOrders: completedOrdersCount,
      totalRevenue,
      addToCartCount,
      checkoutStarted,
      checkoutCompleted,
      checkoutCancelled,
      chatbotUsed,
      conversionRate: checkoutStarted > 0 
        ? (checkoutCompleted / checkoutStarted) * 100 
        : 0,
      productStats: Object.values(productStats),
    }
  },

  // Shipments
  createShipment: async (orderId: string, trackingNumber?: string, carrier?: string, itemIds?: string[]): Promise<Shipment> => {
    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        trackingNumber,
        carrier,
        shippedAt: new Date(),
      },
    })

    // Mark items as shipped and link to shipment
    if (itemIds && itemIds.length > 0) {
      await prisma.orderItem.updateMany({
        where: {
          id: { in: itemIds },
          orderId,
        },
        data: {
          shipped: true,
          shippedAt: new Date(),
          shipmentId: shipment.id,
        },
      })
    }

    // Fetch shipment with items
    const shipmentWithItems = await prisma.shipment.findUnique({
      where: { id: shipment.id },
      include: {
        items: true,
      },
    })

    if (!shipmentWithItems) {
      throw new Error('Failed to create shipment')
    }

    return {
      id: shipmentWithItems.id,
      orderId: shipmentWithItems.orderId,
      trackingNumber: shipmentWithItems.trackingNumber || undefined,
      carrier: shipmentWithItems.carrier || undefined,
      shippedAt: shipmentWithItems.shippedAt || undefined,
      createdAt: shipmentWithItems.createdAt,
      items: shipmentWithItems.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        variety: item.variety || undefined,
        shipped: item.shipped,
        shippedAt: item.shippedAt || undefined,
        shipmentId: item.shipmentId || undefined,
      })),
    }
  },

  getShipmentsByOrderId: async (orderId: string): Promise<Shipment[]> => {
    const shipments = await prisma.shipment.findMany({
      where: { orderId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return shipments.map(shipment => ({
      id: shipment.id,
      orderId: shipment.orderId,
      trackingNumber: shipment.trackingNumber || undefined,
      carrier: shipment.carrier || undefined,
      shippedAt: shipment.shippedAt || undefined,
      createdAt: shipment.createdAt,
      items: shipment.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        variety: item.variety || undefined,
        shipped: item.shipped,
        shippedAt: item.shippedAt || undefined,
        shipmentId: item.shipmentId || undefined,
      })),
    }))
  },

  // Order Messages
  createOrderMessage: async (orderId: string, message: string, isIncident: boolean = false, fromCustomer: boolean = true): Promise<OrderMessage> => {
    const orderMessage = await prisma.orderMessage.create({
      data: {
        orderId,
        message,
        isIncident,
        fromCustomer,
      },
    })

    return {
      id: orderMessage.id,
      orderId: orderMessage.orderId,
      message: orderMessage.message,
      isIncident: orderMessage.isIncident,
      fromCustomer: orderMessage.fromCustomer,
      createdAt: orderMessage.createdAt,
    }
  },

  getOrderMessages: async (orderId: string): Promise<OrderMessage[]> => {
    const messages = await prisma.orderMessage.findMany({
      where: { orderId },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return messages.map(msg => ({
      id: msg.id,
      orderId: msg.orderId,
      message: msg.message,
      isIncident: msg.isIncident,
      fromCustomer: msg.fromCustomer,
      createdAt: msg.createdAt,
    }))
  },

  // Order Status Logs
  createStatusLog: async (log: Omit<OrderStatusLog, 'id' | 'createdAt'>): Promise<OrderStatusLog> => {
    const createdLog = await prisma.orderStatusLog.create({
      data: {
        orderId: log.orderId,
        status: log.status as any,
        description: log.description,
        metadata: log.metadata as any,
      },
    })

    return {
      id: createdLog.id,
      orderId: createdLog.orderId,
      status: createdLog.status as OrderStatusLog['status'],
      description: createdLog.description || undefined,
      metadata: createdLog.metadata as Record<string, any> | undefined,
      createdAt: createdLog.createdAt,
    }
  },

  getStatusLogsByOrderId: async (orderId: string): Promise<OrderStatusLog[]> => {
    const logs = await prisma.orderStatusLog.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    })

    return logs.map(log => ({
      id: log.id,
      orderId: log.orderId,
      status: log.status as OrderStatusLog['status'],
      description: log.description || undefined,
      metadata: log.metadata as Record<string, any> | undefined,
      createdAt: log.createdAt,
    }))
  },
}
