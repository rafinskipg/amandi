'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-fetch'
import styles from '@/components/Dashboard.module.css'

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
  status: 'pending' | 'payment_received' | 'completed' | 'failed' | 'delivered'
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

interface OrderStatusLog {
  id: string
  status: string
  description?: string
  metadata?: Record<string, any>
  createdAt: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [statusLogs, setStatusLogs] = useState<OrderStatusLog[]>([])
  const [loading, setLoading] = useState(true)

  const handleUnauthorized = () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('dashboard_auth')
    router.push('/dashboard')
  }

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const [orderRes, shipmentsRes, messagesRes, statusLogsRes] = await Promise.all([
          adminFetch(`/api/orders/${orderId}`, {}, handleUnauthorized),
          adminFetch(`/api/orders/${orderId}/shipments`, {}, handleUnauthorized),
          adminFetch(`/api/orders/${orderId}/messages`, {}, handleUnauthorized),
          adminFetch(`/api/orders/${orderId}/status-logs`, {}, handleUnauthorized),
        ])

        if (!orderRes.ok || !shipmentsRes.ok || !messagesRes.ok || !statusLogsRes.ok) {
          throw new Error('Failed to fetch order data')
        }

        const orderData = await orderRes.json()
        const shipmentsData = await shipmentsRes.json()
        const messagesData = await messagesRes.json()
        const statusLogsData = await statusLogsRes.json()

        setOrder(orderData.order || orderData)
        setShipments(shipmentsData.shipments || [])
        setMessages(messagesData.messages || [])
        setStatusLogs(statusLogsData.logs || [])
      } catch (error) {
        console.error('Error fetching order:', error)
        alert('Failed to load order. Redirecting...')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderData()
    }
  }, [orderId, router])

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
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'failed':
        return '#ef4444'
      case 'delivered':
        return '#3b82f6'
      default:
        return '#666'
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <h1>Order not found</h1>
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Order {order.orderNumber}</h1>
          <Link href="/dashboard" className={styles.logoutButton}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div>
              <h2 className={styles.orderId}>{order.orderNumber}</h2>
              {order.customerEmail && (
                <p className={styles.orderEmail}>📧 {order.customerEmail}</p>
              )}
              {order.customerPhone && (
                <p className={styles.orderPhone}>📞 {order.customerPhone}</p>
              )}
            </div>
            <div>
              <div className={styles.orderTotal}>
                {formatCurrency(order.total, order.currency)}
              </div>
              <span
                className={styles.orderStatus}
                style={{ color: getStatusColor(order.status) }}
              >
                {order.status}
              </span>
            </div>
          </div>

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
                  {[order.shippingCity, order.shippingState, order.shippingPostalCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {order.shippingCountry && (
                <p className={styles.shippingCountry}>{order.shippingCountry}</p>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className={styles.orderItems}>
            <h3>Order Items</h3>
            {order.items.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <div className={styles.itemCheckbox}>
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

          {/* Status Logs */}
          {statusLogs.length > 0 && (
            <div className={styles.statusLogSection}>
              <h4>Status History</h4>
              <div className={styles.statusTimeline}>
                {statusLogs.map((log) => (
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

          {/* Shipments */}
          {shipments.length > 0 && (
            <div className={styles.shipmentsSection}>
              <h4>Shipments</h4>
              {shipments.map((shipment) => (
                <div key={shipment.id} className={styles.shipmentCard}>
                  <div className={styles.shipmentInfo}>
                    {shipment.trackingNumber && (
                      <p>
                        <strong>Tracking:</strong> {shipment.trackingNumber}
                        {shipment.carrier && ` (${shipment.carrier})`}
                      </p>
                    )}
                    <p>
                      <strong>Shipped:</strong> {formatDate(shipment.shippedAt || shipment.createdAt)}
                    </p>
                    <p>
                      <strong>Items:</strong> {shipment.itemsCount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className={styles.messagesSection}>
              <h4>Messages</h4>
              <div className={styles.messagesList}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageCard} ${message.isIncident ? styles.incidentCard : ''}`}
                  >
                    <div className={styles.messageHeader}>
                      <span className={styles.messageFrom}>
                        {message.fromCustomer ? 'Customer' : 'Admin'}
                      </span>
                      {message.isIncident && (
                        <span className={styles.incidentBadge}>Incident</span>
                      )}
                      <span className={styles.messageDate}>{formatDate(message.createdAt)}</span>
                    </div>
                    <p className={styles.messageText}>{message.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

