'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { Translations } from '@/lib/translations'
import { buildShopRoute } from '@/lib/routes'
import styles from './MaternityIntro.module.css'

interface Props {
  translations: Translations
}

export default function MaternityIntro({ translations }: Props) {
  const pathname = usePathname()
  const [imageError, setImageError] = useState(false)
  const t = translations.maternity

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.intro}>{t.intro}</p>
            
            <div className={styles.benefits}>
              <h2 className={styles.benefitsTitle}>{t.benefitsTitle}</h2>
              <div className={styles.benefitsGrid}>
                {t.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className={styles.benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <span className={styles.benefitIcon}>{benefit.icon}</span>
                    <div className={styles.benefitContent}>
                      <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                      <p className={styles.benefitText}>{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={styles.ctaSection}>
              <Link href={buildShopRoute(pathname)} className={styles.ctaButton}>
                {t.cta}
              </Link>
            </div>
          </motion.div>

          <motion.div
            className={styles.imageContainer}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.imageWrapper}>
              <Image
                src="/pregnancy.png"
                alt={t.imageAlt}
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onError={() => setImageError(true)}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

