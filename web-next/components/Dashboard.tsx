'use client'

import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'

interface Metrics {
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  addToCartCount: number
  checkoutStarted: number
  checkoutCompleted: number
  checkoutCancelled: number
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
  stripeSessionId: string
  customerEmail?: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    variety?: string
  }>
  total: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders'>('metrics')

  useEffect(() => {
    fetchData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [metricsRes, ordersRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/orders?status=completed'),
      ])

      const metricsData = await metricsRes.json()
      const ordersData = await ordersRes.json()

      setMetrics(metricsData.metrics)
      setOrders(ordersData.orders || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
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
            Orders ({orders.length})
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
            <h2 className={styles.sectionTitle}>Completed Orders</h2>
            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No completed orders yet.</p>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <h3 className={styles.orderId}>Order {order.id.slice(-8)}</h3>
                        {order.customerEmail && (
                          <p className={styles.orderEmail}>{order.customerEmail}</p>
                        )}
                      </div>
                      <div className={styles.orderTotal}>
                        {formatCurrency(order.total, order.currency)}
                      </div>
                    </div>
                    <div className={styles.orderItems}>
                      {order.items.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                          <span className={styles.itemName}>
                            {item.productName}
                            {item.variety && ` (${item.variety})`}
                          </span>
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
                      <span className={styles.orderStatus}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

