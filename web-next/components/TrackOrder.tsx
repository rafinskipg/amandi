'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getTranslations, es, type Translations } from '@/lib/translations'
import LanguageSelector from './LanguageSelector'
import Chatbot from './Chatbot'
import styles from './TrackOrder.module.css'

interface OrderDetails {
  orderNumber: string
  status: string
  total: number
  currency: string
  createdAt: string
  completedAt?: string
  items: Array<{
    id: string
    productName: string
    quantity: number
    price: number
    variety?: string
    shipped?: boolean
    shippedAt?: string
  }>
  shipments?: Array<{
    id: string
    trackingNumber?: string
    carrier?: string
    shippedAt?: string
    createdAt: string
    itemsCount: number
  }>
  messages?: Array<{
    id: string
    message: string
    isIncident: boolean
    fromCustomer: boolean
    createdAt: string
  }>
}

interface TrackOrderProps {
  initialOrderNumber?: string
}

export default function TrackOrder({ initialOrderNumber }: TrackOrderProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isIncident, setIsIncident] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Detect language from pathname
  const langMatch = pathname.match(/^\/([a-z]{2})/)
  const lang = langMatch ? langMatch[1] : 'en'
  const t: Translations = getTranslations(lang)
  const isSpanish = t === es

  // If initialOrderNumber is provided, fetch order details automatically
  useEffect(() => {
    if (initialOrderNumber && !orderDetails && !loading) {
      handleSearch(new Event('submit') as any, true)
    }
  }, [initialOrderNumber])

  const handleSearch = async (e: React.FormEvent, skipRedirect = false) => {
    e.preventDefault()
    if (!orderNumber.trim()) {
      setError(t.trackOrder.errors.enterOrderNumber)
      return
    }

    setLoading(true)
    setError(null)
    setOrderDetails(null)

    try {
      const response = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.toUpperCase().trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t.trackOrder.errors.orderNotFound)
      }

      setOrderDetails(data)
      
      // Redirect to /track/{orderNumber} if not already there
      if (!skipRedirect && pathname !== `/${lang}/track/${orderNumber.toUpperCase().trim()}`) {
        router.push(`/${lang}/track/${orderNumber.toUpperCase().trim()}`)
      }
    } catch (err: any) {
      setError(err.message || t.trackOrder.errors.searchError)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !orderDetails) return

    setSendingMessage(true)
    try {
      // Find order ID from order number - we need to get the order first
      const orderResponse = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderDetails.orderNumber)}`)
      const orderData = await orderResponse.json()
      
      // We need the order ID, but the track endpoint doesn't return it
      // We'll need to update the API or use a different approach
      // For now, let's use the orderNumber to find the order
      const response = await fetch(`/api/orders/by-number/${orderDetails.orderNumber}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          isIncident,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Refresh order details by re-fetching
      const refreshResponse = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderDetails.orderNumber)}`)
      const refreshData = await refreshResponse.json()
      if (refreshResponse.ok) {
        setOrderDetails(refreshData)
      }
      
      setMessage('')
      setIsIncident(false)
    } catch (err: any) {
      console.error('Error sending message:', err)
      alert(isSpanish ? 'Error al enviar el mensaje' : 'Error sending message')
    } finally {
      setSendingMessage(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(isSpanish ? 'es-ES' : 'en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isSpanish ? 'es-ES' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status: string) => {
    return t.trackOrder.status[status as keyof typeof t.trackOrder.status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_received':
        return '#10b981' // green
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

  return (
    <>
      <LanguageSelector />
      <section className={styles.section}>
        <div className="container">
          <h1 className={styles.title}>
            {t.trackOrder.title}
          </h1>
          <p className={styles.subtitle}>
            {t.trackOrder.subtitle}
          </p>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder={t.trackOrder.placeholder}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className={styles.searchInput}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className={styles.searchButton}
              >
                {loading ? t.trackOrder.searching : t.trackOrder.search}
              </button>
            </div>
          </form>

          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {orderDetails && (
            <div className={styles.orderDetails}>
              <div className={styles.orderHeader}>
                <div>
                  <h2 className={styles.orderNumberLabel}>
                    {t.trackOrder.orderNumber}
                  </h2>
                  <p className={styles.orderNumber}>{orderDetails.orderNumber}</p>
                </div>
                <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(orderDetails.status) + '20', color: getStatusColor(orderDetails.status) }}>
                  {getStatusLabel(orderDetails.status)}
                </div>
              </div>

              <div className={styles.orderInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t.trackOrder.orderDate}
                  </span>
                  <span className={styles.infoValue}>
                    {formatDate(orderDetails.createdAt)}
                  </span>
                </div>
                {orderDetails.completedAt && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>
                      {t.trackOrder.completedDate}
                    </span>
                    <span className={styles.infoValue}>
                      {formatDate(orderDetails.completedAt)}
                    </span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t.trackOrder.total}
                  </span>
                  <span className={styles.infoValue}>
                    {formatCurrency(orderDetails.total, orderDetails.currency)}
                  </span>
                </div>
              </div>

              <div className={styles.itemsSection}>
                <h3 className={styles.itemsTitle}>
                  {t.trackOrder.products}
                </h3>
                <div className={styles.itemsList}>
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className={styles.item}>
                      <div className={styles.itemName}>
                        {item.productName}
                        {item.variety && ` (${item.variety})`}
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemQuantity}>
                          {item.quantity} × {formatCurrency(item.price, orderDetails.currency)}
                        </span>
                        <span className={styles.itemTotal}>
                          {formatCurrency(item.quantity * item.price, orderDetails.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipments Section */}
              {orderDetails.shipments && orderDetails.shipments.length > 0 && (
                <div className={styles.shipmentsSection}>
                  <h3 className={styles.sectionTitle}>
                    {isSpanish ? 'Envíos' : 'Shipments'} ({orderDetails.shipments.length})
                  </h3>
                  {orderDetails.shipments.map((shipment) => (
                    <div key={shipment.id} className={styles.shipmentCard}>
                      {shipment.trackingNumber && (
                        <p className={styles.trackingInfo}>
                          <strong>{isSpanish ? 'Número de seguimiento:' : 'Tracking Number:'}</strong> {shipment.trackingNumber}
                        </p>
                      )}
                      {shipment.carrier && (
                        <p>
                          <strong>{isSpanish ? 'Transportista:' : 'Carrier:'}</strong> {shipment.carrier}
                        </p>
                      )}
                      {shipment.shippedAt && (
                        <p>
                          <strong>{isSpanish ? 'Enviado:' : 'Shipped:'}</strong> {formatDate(shipment.shippedAt)}
                        </p>
                      )}
                      <p>
                        <strong>{isSpanish ? 'Artículos:' : 'Items:'}</strong> {shipment.itemsCount}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Messages/Incidents Section */}
              <div className={styles.messagesSection}>
                <h3 className={styles.sectionTitle}>
                  {isSpanish ? 'Mensajes e Incidencias' : 'Messages & Incidents'}
                  {orderDetails.messages && orderDetails.messages.length > 0 && ` (${orderDetails.messages.length})`}
                </h3>
                
                {orderDetails.messages && orderDetails.messages.length > 0 && (
                  <div className={styles.messagesList}>
                    {orderDetails.messages.map((msg) => (
                      <div key={msg.id} className={`${styles.messageCard} ${msg.isIncident ? styles.incidentCard : ''}`}>
                        <div className={styles.messageHeader}>
                          <span className={styles.messageFrom}>
                            {msg.fromCustomer ? (isSpanish ? 'Cliente' : 'Customer') : 'Admin'}
                          </span>
                          {msg.isIncident && (
                            <span className={styles.incidentBadge}>
                              ⚠️ {isSpanish ? 'Incidencia' : 'Incident'}
                            </span>
                          )}
                          <span className={styles.messageDate}>{formatDate(msg.createdAt)}</span>
                        </div>
                        <p className={styles.messageText}>{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className={styles.messageForm}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isSpanish ? 'Escribe un mensaje o reporta una incidencia...' : 'Write a message or report an incident...'}
                    className={styles.messageTextarea}
                    rows={4}
                    required
                  />
                  <div className={styles.messageOptions}>
                    <label className={styles.incidentCheckbox}>
                      <input
                        type="checkbox"
                        checked={isIncident}
                        onChange={(e) => setIsIncident(e.target.checked)}
                      />
                      <span>{isSpanish ? 'Marcar como incidencia' : 'Mark as incident'}</span>
                    </label>
                    <button
                      type="submit"
                      disabled={!message.trim() || sendingMessage}
                      className={styles.sendButton}
                    >
                      {sendingMessage 
                        ? (isSpanish ? 'Enviando...' : 'Sending...')
                        : (isSpanish ? 'Enviar Mensaje' : 'Send Message')
                      }
                    </button>
                  </div>
                </form>
              </div>

              {/* Chatbot with order context */}
              <div className={styles.chatbotSection}>
                <Chatbot orderNumber={orderDetails.orderNumber} variant="box" />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

