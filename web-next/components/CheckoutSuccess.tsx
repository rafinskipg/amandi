'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    // Detect language from pathname
    const langMatch = pathname.match(/^\/([a-z]{2})/)
    const detectedLang = langMatch ? langMatch[1] : 'en'
    setLang(detectedLang as 'es' | 'en')

    // Get session ID from URL
    const sessionIdParam = searchParams.get('session_id')
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
      // Fetch order info by session ID
      fetch(`/api/orders?sessionId=${sessionIdParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.order && data.order.orderNumber) {
            setOrderInfo({
              orderNumber: data.order.orderNumber,
              status: data.order.status,
            })
          }
        })
        .catch(err => console.error('Error fetching order:', err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    // Clear cart on successful checkout
    clearCart()
  }, [pathname, searchParams, clearCart])

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
              <p className={styles.sessionId}>
                {t.checkoutSuccess.sessionId}: {sessionId.slice(0, 20)}...
              </p>
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

