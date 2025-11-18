'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { getTranslations, es, type Translations } from '@/lib/translations'
import { buildShopRoute } from '@/lib/routes'
import LanguageSelector from './LanguageSelector'
import Chatbot from './Chatbot'
import styles from './CheckoutSuccess.module.css'

interface CheckoutSuccessProps {
  params?: Promise<{ lang?: string }>
}

interface OrderInfo {
  orderNumber: string
  status: string
}

export default function CheckoutSuccess({ params }: CheckoutSuccessProps = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const hasInitialized = useRef(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Extract values once to avoid dependency issues
  const sessionIdParam = searchParams.get('session_id')
  const langMatch = pathname.match(/^\/([a-z]{2})/)
  const detectedLang = langMatch ? langMatch[1] : 'en'

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Set language
    setLang(detectedLang as 'es' | 'en')
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
      
      // Retry mechanism to fetch order (webhook might take a moment to process)
      let attempts = 0
      const maxAttempts = 10
      const retryDelay = 1000 // 1 second
      
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/orders?sessionId=${sessionIdParam}`)
          const data = await res.json()
          
          if (data.order && data.order.orderNumber) {
            setOrderInfo({
              orderNumber: data.order.orderNumber,
              status: data.order.status,
            })
            setLoading(false)
            // Clear any pending retries
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current)
              retryTimeoutRef.current = null
            }
          } else if (attempts < maxAttempts) {
            // Order not created yet, retry after delay
            attempts++
            retryTimeoutRef.current = setTimeout(fetchOrder, retryDelay)
          } else {
            // Max attempts reached, stop loading
            setLoading(false)
          }
        } catch (err) {
          console.error('Error fetching order:', err)
          if (attempts < maxAttempts) {
            attempts++
            retryTimeoutRef.current = setTimeout(fetchOrder, retryDelay)
          } else {
            setLoading(false)
          }
        }
      }
      
      // Start fetching
      fetchOrder()
    } else {
      setLoading(false)
    }

    // Clear cart on successful checkout (only once)
    clearCart()

    // Cleanup function to clear any pending timeouts
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, []) // Empty dependency array - only run once on mount

  const t: Translations = getTranslations(lang)
  const isSpanish = t === es

  return (
    <>
      <LanguageSelector />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>
              {t.checkoutSuccess.title}
            </h1>
            <p className={styles.message}>
              {t.checkoutSuccess.message}
            </p>
            {loading ? (
              <p className={styles.loadingText}>
                {t.checkoutSuccess.loadingOrder}
              </p>
            ) : orderInfo ? (
              <div className={styles.orderInfo}>
                <p className={styles.orderNumberLabel}>
                  {t.checkoutSuccess.yourOrderNumber}
                </p>
                <p className={styles.orderNumber}>
                  {orderInfo.orderNumber}
                </p>
                <p className={styles.orderStatus}>
                  {t.checkoutSuccess.status}: <span className={styles.statusValue}>{orderInfo.status}</span>
                </p>
              </div>
            ) : sessionId ? (
              <div className={styles.orderInfo}>
                <p className={styles.loadingText}>
                  {isSpanish 
                    ? 'Procesando tu pedido... El número de pedido aparecerá en breve. Si no aparece, puedes usar el ID de sesión para contactarnos.'
                    : 'Processing your order... Your order number will appear shortly. If it doesn\'t appear, you can use the session ID to contact us.'}
                </p>
                <p className={styles.sessionId}>
                  {isSpanish ? 'ID de sesión' : 'Session ID'}: {sessionId}
                </p>
              </div>
            ) : null}
            <div className={styles.actions}>
              <Link href={buildShopRoute(pathname)} className={styles.shopButton}>
                {t.checkoutSuccess.continueShopping}
              </Link>
              <Link 
                href={`/${lang}/track`} 
                className={styles.trackButton}
              >
                {t.checkoutSuccess.trackOrder}
              </Link>
            </div>

            {/* Chatbot with order context */}
            {orderInfo && (
              <div className={styles.chatbotSection}>
                <Chatbot orderNumber={orderInfo.orderNumber} variant="box" />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

