'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import { adminFetch } from '@/lib/admin-fetch'

interface Metrics {
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  addToCartCount: number
  checkoutStarted: number
  checkoutCompleted: number
  checkoutCancelled: number
  chatbotUsed: number
  conversionRate: number
  productStats: Array<{
    productId: string
    productName: string
    addToCartCount: number
    totalQuantity: number
  }>
}

interface Order {
  id: string
  orderNumber: string
  stripeSessionId: string
  customerEmail?: string
  customerPhone?: string
  shippingName?: string
  shippingLine1?: string
  shippingLine2?: string
  shippingCity?: string
  shippingState?: string
  shippingPostalCode?: string
  shippingCountry?: string
  items: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
    variety?: string
    shipped?: boolean
    shippedAt?: string
    shipmentId?: string
  }>
  total: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'delivered'
  createdAt: string
  completedAt?: string
}

interface Shipment {
  id: string
  trackingNumber?: string
  carrier?: string
  shippedAt?: string
  createdAt: string
  itemsCount: number
}

interface OrderMessage {
  id: string
  message: string
  isIncident: boolean
  fromCustomer: boolean
  createdAt: string
}

interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const router = useRouter()

  // Handle unauthorized errors
  const handleUnauthorized = () => {
    onLogout()
    router.push('/dashboard')
  }
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [ordersResponse, setOrdersResponse] = useState<OrdersResponse>({
    orders: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders'>('metrics')
  
  // Orders filters and pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'total' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [orderShipments, setOrderShipments] = useState<Record<string, Shipment[]>>({})
  const [orderMessages, setOrderMessages] = useState<Record<string, OrderMessage[]>>({})
  const [orderStatusLogs, setOrderStatusLogs] = useState<Record<string, any[]>>({})
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({})
  const [trackingNumber, setTrackingNumber] = useState<Record<string, string>>({})
  const [carrier, setCarrier] = useState<Record<string, string>>({})
  const [creatingShipment, setCreatingShipment] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState<Record<string, string>>({})
  const [sendingMessage, setSendingMessage] = useState<string | null>(null)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [showStickerModal, setShowStickerModal] = useState<string | null>(null)
  const [stickerData, setStickerData] = useState<any>(null)

  const fetchData = async () => {
    try {
      const metricsRes = await adminFetch('/api/metrics', {}, handleUnauthorized)
      if (!metricsRes.ok) {
        throw new Error('Failed to fetch metrics')
      }
      const metricsData = await metricsRes.json()
      setMetrics(metricsData.metrics)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Also fetch orders count for the tab label
    fetchOrders()
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData()
      if (activeTab === 'orders') {
        fetchOrders()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab, currentPage, statusFilter, sortBy, sortOrder])

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const [shipmentsRes, messagesRes, statusLogsRes] = await Promise.all([
        adminFetch(`/api/orders/${orderId}/shipments`, {}, handleUnauthorized),
        adminFetch(`/api/orders/${orderId}/messages`, {}, handleUnauthorized),
        adminFetch(`/api/orders/${orderId}/status-logs`, {}, handleUnauthorized),
      ])
      const shipmentsData = await shipmentsRes.json()
      const messagesData = await messagesRes.json()
      const statusLogsData = await statusLogsRes.json()
      setOrderShipments(prev => ({ ...prev, [orderId]: shipmentsData.shipments || [] }))
      setOrderMessages(prev => ({ ...prev, [orderId]: messagesData.messages || [] }))
      setOrderStatusLogs(prev => ({ ...prev, [orderId]: statusLogsData.logs || [] }))
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const handleToggleOrder = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    } else {
      setExpandedOrderId(orderId)
      if (!orderShipments[orderId]) {
        fetchOrderDetails(orderId)
      }
    }
  }

  const handleItemToggle = (orderId: string, itemId: string) => {
    setSelectedItems(prev => {
      const current = prev[orderId] || []
      if (current.includes(itemId)) {
        return { ...prev, [orderId]: current.filter(id => id !== itemId) }
      } else {
        return { ...prev, [orderId]: [...current, itemId] }
      }
    })
  }

  const handleCreateShipment = async (orderId: string) => {
    const itemIds = selectedItems[orderId] || []
    if (itemIds.length === 0) {
      alert('Please select at least one item to ship')
      return
    }

    setCreatingShipment(orderId)
    try {
      const response = await adminFetch(`/api/orders/${orderId}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber[orderId] || undefined,
          carrier: carrier[orderId] || undefined,
          itemIds,
        }),
      }, handleUnauthorized)

      if (!response.ok) {
        throw new Error('Failed to create shipment')
      }

      // Create status log for shipment
      await adminFetch(`/api/orders/${orderId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'shipped',
          description: `Shipment created with tracking ${trackingNumber[orderId] || 'N/A'}`,
          metadata: {
            trackingNumber: trackingNumber[orderId],
            carrier: carrier[orderId],
          },
        }),
      }, handleUnauthorized)

      // Refresh order details and orders list
      await fetchOrderDetails(orderId)
      await fetchOrders()
      setSelectedItems(prev => ({ ...prev, [orderId]: [] }))
      setTrackingNumber(prev => ({ ...prev, [orderId]: '' }))
      setCarrier(prev => ({ ...prev, [orderId]: '' }))
    } catch (error) {
      console.error('Error creating shipment:', error)
      alert('Failed to create shipment')
    } finally {
      setCreatingShipment(null)
    }
  }

  const handleSendMessage = async (orderId: string, isIncident: boolean = false) => {
    const message = newMessage[orderId]?.trim()
    if (!message) {
      alert('Please enter a message')
      return
    }

    setSendingMessage(orderId)
    try {
      const response = await adminFetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          isIncident,
        }),
      }, handleUnauthorized)

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Refresh messages
      await fetchOrderDetails(orderId)
      setNewMessage(prev => ({ ...prev, [orderId]: '' }))
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSendingMessage(null)
    }
  }

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const ordersRes = await adminFetch(`/api/orders?${params}`, {}, handleUnauthorized)
      const ordersData = await ordersRes.json()
      setOrdersResponse(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchOrders()
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId)
    try {
      const order = ordersResponse.orders.find(o => o.id === orderId)
      
      const response = await adminFetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      }, handleUnauthorized)

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      // Create status log and event for status change
      if (newStatus === 'completed' && order?.status === 'pending') {
        // If marking pending order as completed, create checkout_completed event
        await fetch(`/api/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'checkout_completed',
            sessionId: order.stripeSessionId,
            metadata: {
              orderId: orderId,
              orderNumber: order.orderNumber,
              total: order.total,
              manuallyCompleted: true,
            },
          }),
        })
      }
      
      if (newStatus === 'delivered') {
        await adminFetch(`/api/orders/${orderId}/actions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'delivered' }),
        }, handleUnauthorized)
      }

      // Refresh orders, order details, and metrics
      await fetchOrders()
      await fetchOrderDetails(orderId)
      await fetchData() // Refresh metrics
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleOrderAction = async (orderId: string, action: 'return' | 'reship' | 'customer_contacted') => {
    setProcessingAction(`${orderId}-${action}`)
    try {
      const response = await adminFetch(`/api/orders/${orderId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      }, handleUnauthorized)

      if (!response.ok) {
        throw new Error('Failed to process action')
      }

      // Refresh order details to show new status log
      await fetchOrderDetails(orderId)
      await fetchOrders()
    } catch (error) {
      console.error('Error processing order action:', error)
      alert('Failed to process action')
    } finally {
      setProcessingAction(null)
    }
  }

  const handleGenerateSticker = async (orderId: string) => {
    try {
      const response = await adminFetch(`/api/orders/${orderId}/delivery-sticker`, {}, handleUnauthorized)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate sticker')
      }

      setStickerData(data)
      setShowStickerModal(orderId)
    } catch (error: any) {
      console.error('Error generating sticker:', error)
      alert(error.message || 'Failed to generate sticker')
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return '#10b981' // green
      case 'delivered':
        return '#3b82f6' // blue
      case 'pending':
        return '#f59e0b' // amber
      case 'failed':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
          <button onClick={onLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.container}>
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'metrics' ? styles.active : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({ordersResponse.total})
          </button>
        </nav>

        {activeTab === 'metrics' && metrics && (
          <div className={styles.metrics}>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📦</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Total Orders</h3>
                  <p className={styles.metricValue}>{metrics.totalOrders}</p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>✅</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Completed Orders</h3>
                  <p className={styles.metricValue}>{metrics.completedOrders}</p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>💰</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Total Revenue</h3>
                  <p className={styles.metricValue}>
                    {formatCurrency(metrics.totalRevenue)}
                  </p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🛒</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Add to Cart</h3>
                  <p className={styles.metricValue}>{metrics.addToCartCount}</p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🚀</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Checkout Started</h3>
                  <p className={styles.metricValue}>{metrics.checkoutStarted}</p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>✨</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Checkout Completed</h3>
                  <p className={styles.metricValue}>{metrics.checkoutCompleted}</p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>❌</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Checkout Cancelled</h3>
                  <p className={styles.metricValue}>{metrics.checkoutCancelled}</p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>💬</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Chatbot Interactions</h3>
                  <p className={styles.metricValue}>{metrics.chatbotUsed}</p>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📊</div>
                <div className={styles.metricContent}>
                  <h3 className={styles.metricLabel}>Conversion Rate</h3>
                  <p className={styles.metricValue}>
                    {metrics.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {metrics.productStats.length > 0 && (
              <div className={styles.productStats}>
                <h2 className={styles.sectionTitle}>Product Performance</h2>
                <div className={styles.productTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Add to Cart</th>
                        <th>Total Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.productStats.map((product) => (
                        <tr key={product.productId}>
                          <td>{product.productName}</td>
                          <td>{product.addToCartCount}</td>
                          <td>{product.totalQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={styles.orders}>
            <div className={styles.ordersHeader}>
              <h2 className={styles.sectionTitle}>Orders</h2>
              
              {/* Search and Filters */}
              <div className={styles.filters}>
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="Search by email, phone, or session ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className={styles.searchInput}
                  />
                  <button onClick={handleSearch} className={styles.searchButton}>
                    🔍
                  </button>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-')
                    setSortBy(by as any)
                    setSortOrder(order as any)
                    setCurrentPage(1)
                  }}
                  className={styles.filterSelect}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="total-desc">Highest Total</option>
                  <option value="total-asc">Lowest Total</option>
                  <option value="status-asc">Status A-Z</option>
                  <option value="status-desc">Status Z-A</option>
                </select>
              </div>
            </div>

            {ordersResponse.orders.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No orders found.</p>
              </div>
            ) : (
              <>
                <div className={styles.ordersList}>
                  {ordersResponse.orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id
                    const shipments = orderShipments[order.id] || []
                    const messages = orderMessages[order.id] || []
                    const selectedItemIds = selectedItems[order.id] || []
                    const allItemsShipped = order.items.every(item => item.shipped)
                    
                    return (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                          <div>
                            <h3 className={styles.orderId}>
                              <Link href={`/dashboard/orders/${order.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                Order {order.orderNumber}
                              </Link>
                            </h3>
                            {order.customerEmail && (
                              <p className={styles.orderEmail}>📧 {order.customerEmail}</p>
                            )}
                            {order.customerPhone && (
                              <p className={styles.orderPhone}>📱 {order.customerPhone}</p>
                            )}
                            {/* Shipping Address */}
                            {(order.shippingName || order.shippingLine1) && (
                              <div className={styles.shippingAddress}>
                                <p className={styles.shippingLabel}>📍 Shipping Address:</p>
                                {order.shippingName && <p className={styles.shippingName}>{order.shippingName}</p>}
                                {order.shippingLine1 && (
                                  <p className={styles.shippingLine}>
                                    {order.shippingLine1}
                                    {order.shippingLine2 && `, ${order.shippingLine2}`}
                                  </p>
                                )}
                                {(order.shippingCity || order.shippingState || order.shippingPostalCode) && (
                                  <p className={styles.shippingCity}>
                                    {[
                                      order.shippingCity,
                                      order.shippingState,
                                      order.shippingPostalCode
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                )}
                                {order.shippingCountry && (
                                  <p className={styles.shippingCountry}>{order.shippingCountry}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className={styles.orderTotal}>
                            {formatCurrency(order.total, order.currency)}
                          </div>
                        </div>
                        <div className={styles.orderItems}>
                          {order.items.map((item) => (
                            <div key={item.id} className={styles.orderItem}>
                              <div className={styles.itemCheckbox}>
                                <input
                                  type="checkbox"
                                  checked={item.shipped || false}
                                  disabled
                                  className={styles.checkbox}
                                />
                                <span className={styles.itemName}>
                                  {item.productName}
                                  {item.variety && ` (${item.variety})`}
                                  {item.shipped && <span className={styles.shippedBadge}>✓ Shipped</span>}
                                </span>
                              </div>
                              <span className={styles.itemDetails}>
                                {item.quantity} × {formatCurrency(item.price, order.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className={styles.orderFooter}>
                          <span className={styles.orderDate}>
                            {formatDate(order.completedAt || order.createdAt)}
                          </span>
                          <div className={styles.orderStatusControls}>
                            <span
                              className={styles.orderStatus}
                              style={{ color: getStatusColor(order.status) }}
                            >
                              {order.status}
                            </span>
                            <button
                              onClick={() => handleToggleOrder(order.id)}
                              className={styles.expandButton}
                            >
                              {isExpanded ? '▼' : '▶'} Details
                            </button>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'completed')}
                                disabled={updatingOrderId === order.id}
                                className={styles.statusButton}
                              >
                                {updatingOrderId === order.id ? '...' : 'Mark as Completed'}
                              </button>
                            )}
                            {order.status === 'completed' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                disabled={updatingOrderId === order.id}
                                className={styles.statusButton}
                              >
                                {updatingOrderId === order.id ? '...' : 'Mark as Delivered'}
                              </button>
                            )}
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'completed')}
                                disabled={updatingOrderId === order.id}
                                className={styles.statusButton}
                              >
                                {updatingOrderId === order.id ? '...' : 'Mark as Completed'}
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className={styles.orderDetails}>
                            {/* Order Actions */}
                            <div className={styles.actionsSection}>
                              <h4>Order Actions</h4>
                              <div className={styles.actionButtons}>
                                <button
                                  onClick={() => handleOrderAction(order.id, 'customer_contacted')}
                                  disabled={processingAction === `${order.id}-customer_contacted`}
                                  className={styles.actionButton}
                                >
                                  {processingAction === `${order.id}-customer_contacted` ? '...' : '📞 Mark as Contacted'}
                                </button>
                                <button
                                  onClick={() => handleOrderAction(order.id, 'reship')}
                                  disabled={processingAction === `${order.id}-reship`}
                                  className={styles.actionButton}
                                >
                                  {processingAction === `${order.id}-reship` ? '...' : '📦 Reship Order'}
                                </button>
                                <button
                                  onClick={() => handleOrderAction(order.id, 'return')}
                                  disabled={processingAction === `${order.id}-return`}
                                  className={styles.actionButton}
                                >
                                  {processingAction === `${order.id}-return` ? '...' : '↩️ Mark as Returned'}
                                </button>
                                <button
                                  onClick={() => handleGenerateSticker(order.id)}
                                  className={styles.actionButton}
                                >
                                  🏷️ Generate Delivery Sticker
                                </button>
                              </div>
                            </div>

                            {/* Status Log Timeline */}
                            {orderStatusLogs[order.id] && orderStatusLogs[order.id].length > 0 && (
                              <div className={styles.statusLogSection}>
                                <h4>Status History</h4>
                                <div className={styles.statusTimeline}>
                                  {orderStatusLogs[order.id].map((log, index) => (
                                    <div key={log.id} className={styles.statusLogItem}>
                                      <div className={styles.statusLogIcon}>
                                        {log.status === 'created' && '📝'}
                                        {log.status === 'payment_confirmed' && '💳'}
                                        {log.status === 'shipped' && '📦'}
                                        {log.status === 'reshipped' && '🔄'}
                                        {log.status === 'customer_contacted' && '📞'}
                                        {log.status === 'returned' && '↩️'}
                                        {log.status === 'delivered' && '✅'}
                                      </div>
                                      <div className={styles.statusLogContent}>
                                        <div className={styles.statusLogStatus}>
                                          {log.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                        </div>
                                        {log.description && (
                                          <div className={styles.statusLogDescription}>{log.description}</div>
                                        )}
                                        <div className={styles.statusLogDate}>{formatDate(log.createdAt)}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ship Products Section */}
                            <div className={styles.shipmentSection}>
                              <h4>Ship Products</h4>
                              <div className={styles.itemsToShip}>
                                {order.items.filter(item => !item.shipped).map((item) => (
                                  <label key={item.id} className={styles.itemCheckboxLabel}>
                                    <input
                                      type="checkbox"
                                      checked={selectedItemIds.includes(item.id)}
                                      onChange={() => handleItemToggle(order.id, item.id)}
                                      className={styles.checkbox}
                                    />
                                    <span>
                                      {item.productName}
                                      {item.variety && ` (${item.variety})`} - Qty: {item.quantity}
                                    </span>
                                  </label>
                                ))}
                                {allItemsShipped && (
                                  <p className={styles.allShipped}>All items have been shipped</p>
                                )}
                              </div>
                              {selectedItemIds.length > 0 && (
                                <div className={styles.shipmentForm}>
                                  <input
                                    type="text"
                                    placeholder="Tracking Number"
                                    value={trackingNumber[order.id] || ''}
                                    onChange={(e) => setTrackingNumber(prev => ({ ...prev, [order.id]: e.target.value }))}
                                    className={styles.trackingInput}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Carrier (e.g., GLS, DHL)"
                                    value={carrier[order.id] || ''}
                                    onChange={(e) => setCarrier(prev => ({ ...prev, [order.id]: e.target.value }))}
                                    className={styles.carrierInput}
                                  />
                                  <button
                                    onClick={() => handleCreateShipment(order.id)}
                                    disabled={creatingShipment === order.id}
                                    className={styles.createShipmentButton}
                                  >
                                    {creatingShipment === order.id ? 'Creating...' : 'Create Shipment'}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Shipments List */}
                            {shipments.length > 0 && (
                              <div className={styles.shipmentsSection}>
                                <h4>Shipments ({shipments.length})</h4>
                                {shipments.map((shipment) => (
                                  <div key={shipment.id} className={styles.shipmentCard}>
                                    <div className={styles.shipmentInfo}>
                                      {shipment.trackingNumber && (
                                        <p><strong>Tracking:</strong> {shipment.trackingNumber}</p>
                                      )}
                                      {shipment.carrier && (
                                        <p><strong>Carrier:</strong> {shipment.carrier}</p>
                                      )}
                                      {shipment.shippedAt && (
                                        <p><strong>Shipped:</strong> {formatDate(shipment.shippedAt)}</p>
                                      )}
                                      <p><strong>Items:</strong> {shipment.itemsCount}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Messages/Incidents Section */}
                            <div className={styles.messagesSection}>
                              <h4>Messages & Incidents ({messages.length})</h4>
                              <div className={styles.messagesList}>
                                {messages.map((msg) => (
                                  <div key={msg.id} className={`${styles.messageCard} ${msg.isIncident ? styles.incidentCard : ''}`}>
                                    <div className={styles.messageHeader}>
                                      <span className={styles.messageFrom}>
                                        {msg.fromCustomer ? 'Customer' : 'Admin'}
                                      </span>
                                      {msg.isIncident && <span className={styles.incidentBadge}>⚠️ Incident</span>}
                                      <span className={styles.messageDate}>{formatDate(msg.createdAt)}</span>
                                    </div>
                                    <p className={styles.messageText}>{msg.message}</p>
                                  </div>
                                ))}
                              </div>
                              <div className={styles.newMessageForm}>
                                <textarea
                                  placeholder="Add a message or report an incident..."
                                  value={newMessage[order.id] || ''}
                                  onChange={(e) => setNewMessage(prev => ({ ...prev, [order.id]: e.target.value }))}
                                  className={styles.messageTextarea}
                                  rows={3}
                                />
                                <div className={styles.messageButtons}>
                                  <button
                                    onClick={() => handleSendMessage(order.id, false)}
                                    disabled={sendingMessage === order.id || !newMessage[order.id]?.trim()}
                                    className={styles.sendMessageButton}
                                  >
                                    {sendingMessage === order.id ? 'Sending...' : 'Send Message'}
                                  </button>
                                  <button
                                    onClick={() => handleSendMessage(order.id, true)}
                                    disabled={sendingMessage === order.id || !newMessage[order.id]?.trim()}
                                    className={styles.reportIncidentButton}
                                  >
                                    Report Incident
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {ordersResponse.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={styles.paginationButton}
                    >
                      Previous
                    </button>
                    <span className={styles.paginationInfo}>
                      Page {currentPage} of {ordersResponse.totalPages} ({ordersResponse.total} total)
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(ordersResponse.totalPages, p + 1))}
                      disabled={currentPage === ordersResponse.totalPages}
                      className={styles.paginationButton}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Delivery Sticker Modal */}
      {showStickerModal && stickerData && (
        <DeliveryStickerModal
          data={stickerData}
          onClose={() => {
            setShowStickerModal(null)
            setStickerData(null)
          }}
        />
      )}
    </div>
  )
}

// Delivery Sticker Modal Component
function DeliveryStickerModal({ data, onClose }: { data: any; onClose: () => void }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    // Generate QR code using a QR code API
    // Using qrcode.js or similar library would be better, but for now using an API
    const qrSize = 200
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(data.qrCodeData)}`
    setQrCodeUrl(qrApiUrl)
  }, [data.qrCodeData])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Delivery Sticker</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.stickerContainer}>
          <div className={styles.sticker}>
            {/* Logo */}
            <div className={styles.stickerLogo}>
              <h1>🥑 Avocados Amandi</h1>
            </div>

            {/* Nice sentence */}
            <div className={styles.stickerMessage}>
              <p>Fresh avocados, delivered with care from our farm to your door</p>
            </div>

            {/* Shipping Address */}
            <div className={styles.stickerAddress}>
              <h3>Ship To:</h3>
              {data.shippingName && <p className={styles.stickerName}>{data.shippingName}</p>}
              <pre className={styles.stickerAddressText}>{data.shippingAddress}</pre>
            </div>

            {/* Order Info */}
            <div className={styles.stickerOrderInfo}>
              <div className={styles.stickerOrderNumber}>
                <strong>Order:</strong> {data.orderNumber}
              </div>
              {data.trackingNumber && (
                <div className={styles.stickerTracking}>
                  <strong>Tracking:</strong> {data.trackingNumber}
                  {data.carrier && ` (${data.carrier})`}
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className={styles.stickerQR}>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className={styles.qrCodeImage} />
              )}
              <p className={styles.qrCodeLabel}>Scan to track your order</p>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={handlePrint} className={styles.printButton}>
            🖨️ Print Sticker
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
