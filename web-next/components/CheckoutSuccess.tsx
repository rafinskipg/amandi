'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { es, en, type Translations } from '@/lib/translations'
import { buildShopRoute } from '@/lib/routes'
import LanguageSelector from './LanguageSelector'
import styles from './CheckoutSuccess.module.css'

interface CheckoutSuccessProps {
  params?: Promise<{ lang?: string }>
}

export default function CheckoutSuccess({ params }: CheckoutSuccessProps = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lang, setLang] = useState<'es' | 'en'>('es')

  useEffect(() => {
    // Detect language from pathname
    const langMatch = pathname.match(/^\/(en|es)/)
    const detectedLang = (langMatch ? langMatch[1] : 'es') as 'es' | 'en'
    setLang(detectedLang)

    // Get session ID from URL
    const sessionIdParam = searchParams.get('session_id')
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
    }

    // Clear cart on successful checkout
    clearCart()
  }, [pathname, searchParams, clearCart])

  const isSpanish = lang === 'es'
  const t: Translations = isSpanish ? es : en

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
            {sessionId && (
              <p className={styles.sessionId}>
                {t.checkoutSuccess.sessionId}: {sessionId}
              </p>
            )}
            <div className={styles.actions}>
              <Link href={buildShopRoute(pathname)} className={styles.shopButton}>
                {t.checkoutSuccess.continueShopping}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

