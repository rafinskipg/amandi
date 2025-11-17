'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { es, en, type Translations } from '@/lib/translations'
import { buildShopRoute, buildCheckoutRoute } from '@/lib/routes'
import LanguageSelector from './LanguageSelector'
import styles from './CheckoutCancel.module.css'

interface CheckoutCancelProps {
  params?: Promise<{ lang?: string }>
}

export default function CheckoutCancel({ params }: CheckoutCancelProps = {}) {
  const pathname = usePathname()
  const [lang, setLang] = useState<'es' | 'en'>('es')

  useEffect(() => {
    // Detect language from pathname
    const langMatch = pathname.match(/^\/(en|es)/)
    const detectedLang = (langMatch ? langMatch[1] : 'es') as 'es' | 'en'
    setLang(detectedLang)
  }, [pathname])

  const isSpanish = lang === 'es'
  const t: Translations = isSpanish ? es : en

  return (
    <>
      <LanguageSelector />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.cancelContainer}>
            <div className={styles.cancelIcon}>✕</div>
            <h1 className={styles.title}>
              {t.checkoutCancel.title}
            </h1>
            <p className={styles.message}>
              {t.checkoutCancel.message}
            </p>
            <div className={styles.actions}>
              <Link href={buildCheckoutRoute(pathname)} className={styles.checkoutButton}>
                {t.checkoutCancel.backToCart}
              </Link>
              <Link href={buildShopRoute(pathname)} className={styles.shopButton}>
                {t.checkoutCancel.continueShopping}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

