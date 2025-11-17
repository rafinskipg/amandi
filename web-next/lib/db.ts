// In-memory database for orders and events
// In production, this would be replaced with a real database

export interface Order {
  id: string
  stripeSessionId: string
  customerEmail?: string
  items: OrderItem[]
  total: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  variety?: string
}

export interface Event {
  id: string
  type: 'add_to_cart' | 'checkout_started' | 'checkout_completed' | 'checkout_cancelled'
  productId?: string
  productName?: string
  quantity?: number
  variety?: string
  sessionId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

// In-memory storage
const orders: Order[] = []
const events: Event[] = []

// Orders API
export const db = {
  // Orders
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }
    orders.push(newOrder)
    return newOrder
  },

  updateOrder: (id: string, updates: Partial<Order>): Order | null => {
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) return null
    
    orders[index] = { ...orders[index], ...updates }
    return orders[index]
  },

  getOrder: (id: string): Order | null => {
    return orders.find(o => o.id === id) || null
  },

  getOrderBySessionId: (sessionId: string): Order | null => {
    return orders.find(o => o.stripeSessionId === sessionId) || null
  },

  getAllOrders: (): Order[] => {
    return [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  getCompletedOrders: (): Order[] => {
    return orders
      .filter(o => o.status === 'completed')
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
  },

  // Events
  createEvent: (event: Omit<Event, 'id' | 'timestamp'>): Event => {
    const newEvent: Event = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    events.push(newEvent)
    return newEvent
  },

  getAllEvents: (): Event[] => {
    return [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  getEventsByType: (type: Event['type']): Event[] => {
    return events
      .filter(e => e.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  // Metrics
  getMetrics: () => {
    const addToCartEvents = events.filter(e => e.type === 'add_to_cart')
    const checkoutStarted = events.filter(e => e.type === 'checkout_started').length
    const checkoutCompleted = events.filter(e => e.type === 'checkout_completed').length
    const checkoutCancelled = events.filter(e => e.type === 'checkout_cancelled').length
    
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)
    
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
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalRevenue,
      addToCartCount: addToCartEvents.length,
      checkoutStarted,
      checkoutCompleted,
      checkoutCancelled,
      conversionRate: checkoutStarted > 0 
        ? (checkoutCompleted / checkoutStarted) * 100 
        : 0,
      productStats: Object.values(productStats),
    }
  },
}

