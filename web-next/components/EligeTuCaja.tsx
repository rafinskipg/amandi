'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import type { CountryConfig } from '@/lib/countries'
import { getCountryTranslation } from '@/lib/countryTranslations'
import { buildProductRoute } from '@/lib/routes'
import { products } from '@/lib/products'
import styles from './EligeTuCaja.module.css'

interface Props {
  translations: Translations
  country?: CountryConfig
}

export default function EligeTuCaja({ translations, country }: Props) {
  const pathname = usePathname()
  const t = translations.eligeTuCaja
  const checkout = country 
    ? getCountryTranslation(country.code).checkout 
    : { buy: '/checkout', subscribe: '/checkout?type=subscription' }

  return (
    <section id="elige-tu-caja" className={styles.section}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t.title}</h2>

          <div className={styles.grid}>
            {t.boxes.map((box, index) => {
              // Map box index to product ID (filter out hidden products)
              const productIds = ['box-3kg', 'box-5kg', 'subscription'].filter(id => {
                const product = products.find(p => p.id === id)
                return product && product.inStock !== false
              })
              // Skip if this index doesn't exist after filtering
              if (index >= productIds.length) return null
              const productId = productIds[index]
              const productUrl = buildProductRoute(pathname, productId)
              
              return (
                <motion.div
                  key={index}
                  className={`${styles.card} ${index === 2 ? styles.featured : ''}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <h3 className={styles.title}>{box.title}</h3>
                  {box.avocados && (
                    <p className={styles.avocados}>{box.avocados}</p>
                  )}
                  {box.description && (
                    <p className={styles.description}>{box.description}</p>
                  )}
                  {box.features && (
                    <ul className={styles.features}>
                      {box.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  )}
                  <Link href={productUrl} className={`btn-primary ${styles.cta}`}>
                    {box.cta}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
