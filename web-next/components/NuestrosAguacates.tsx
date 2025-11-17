'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import type { CountryConfig } from '@/lib/countries'
import { getCountryTranslation } from '@/lib/countryTranslations'
import { buildShopRoute } from '@/lib/routes'
import styles from './NuestrosAguacates.module.css'

interface Props {
  translations: Translations
  country?: CountryConfig
}

export default function NuestrosAguacates({ translations, country }: Props) {
  const pathname = usePathname()
  const t = translations.nuestrosAguacates
  const checkout = country 
    ? getCountryTranslation(country.code).checkout 
    : { buy: '/checkout', subscribe: '/checkout?type=subscription' }

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="nuestros-aguacates" className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          <motion.div
            className={styles.text}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">{t.title}</h2>
            <p className={styles.copy}>{t.copy1}</p>
            <p className={styles.copy}>{t.copy2}</p>
            
            <ul className={styles.values}>
              {t.values.map((value, index) => (
                <li key={index} className={styles.valueItem}>
                  <span className={styles.valueIcon}>{value.icon}</span>
                  <span className={styles.valueText}>{value.text}</span>
                </li>
              ))}
            </ul>

            <Link href={buildShopRoute(pathname)} className="btn-primary">
              {t.cta}
            </Link>
          </motion.div>

          <motion.div
            className={styles.image}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.imageContainer}>
              <Image
                src="/assets/finca.png"
                alt="Nuestra finca en Asturias"
                width={800}
                height={600}
                className={styles.fincaImage}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
