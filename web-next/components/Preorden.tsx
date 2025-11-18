'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import type { CountryConfig } from '@/lib/countries'
import { getCountryTranslation } from '@/lib/countryTranslations'
import { es } from '@/lib/translations'
import { buildProductRoute } from '@/lib/routes'
import { products } from '@/lib/products'
import styles from './Preorden.module.css'

interface Props {
  translations: Translations
  country?: CountryConfig
}

export default function Preorden({ translations, country }: Props) {
  const pathname = usePathname()
  const t = translations.preorden
  
  // Filter out hidden products to determine initial selection
  const getProductId = (boxValue: string): string => {
    const boxToProductMap: Record<string, string> = {
      '3kg': 'box-3kg',
      '5kg': 'box-5kg',
      'subscription': 'subscription',
    }
    return boxToProductMap[boxValue] || 'box-3kg'
  }
  
  const availableBoxes = t.boxes.filter(box => {
    const productId = getProductId(box.value)
    const product = products.find(p => p.id === productId)
    return product && product.inStock !== false
  })
  
  const [selectedBox, setSelectedBox] = useState(availableBoxes[0]?.value || '3kg')
  const countryT = country ? getCountryTranslation(country.code) : null
  
  // Determine box selector title based on language
  const isSpanish = translations === es || country?.language === 'es'
  const boxSelectorTitle = countryT?.preorden?.boxSelectorTitle || (isSpanish ? 'Elige tu caja' : 'Choose your box')

  // Ensure selectedBox is valid (if subscription was selected but is now hidden, default to first available)
  const validSelectedBox = availableBoxes.some(box => box.value === selectedBox) 
    ? selectedBox 
    : (availableBoxes[0]?.value || '3kg')

  const preorderButtonText = isSpanish ? 'Pre-ordenar' : 'Pre-order'

  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t.title}</h2>
          <p className={styles.copy}>{t.copy}</p>

          <div className={styles.layout}>
            <div className={styles.content}>
              <div className={styles.howItWorks}>
                <h3 className={styles.howItWorksTitle}>{t.howItWorks.title}</h3>
                <ul className={styles.steps}>
                  {t.howItWorks.steps.map((step, index) => (
                    <li key={index} className={styles.stepItem}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <span className={styles.stepText}>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.proofPoints}>
                {t.proofPoints.map((point, index) => (
                  <div key={index} className={styles.proofPoint}>
                    <span className={styles.proofIcon}>{point.icon}</span>
                    <span className={styles.proofText}>{point.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.boxSelectorCard}>
              <h3 className={styles.boxSelectorTitle}>{boxSelectorTitle}</h3>
              <div className={styles.boxOptions}>
                {availableBoxes.map((box) => (
                  <button
                    key={box.value}
                    className={`${styles.boxOption} ${validSelectedBox === box.value ? styles.selected : ''}`}
                    onClick={() => setSelectedBox(box.value)}
                  >
                    {box.label}
                  </button>
                ))}
              </div>
              <Link 
                href={buildProductRoute(pathname, getProductId(validSelectedBox))}
                className={styles.preorderButton}
              >
                {preorderButtonText}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
