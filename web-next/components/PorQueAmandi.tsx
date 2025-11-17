'use client'

import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import type { CountryConfig } from '@/lib/countries'
import styles from './PorQueAmandi.module.css'

interface Props {
  translations: Translations
  country?: CountryConfig
}

export default function PorQueAmandi({ translations }: Props) {
  const t = translations.porQueAmandi

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

          <div className={styles.grid}>
            {t.pillars.map((pillar, index) => (
              <motion.div
                key={index}
                className={styles.card}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className={styles.number}>{index + 1}</div>
                <h3 className={styles.title}>{pillar.title}</h3>
                <p className={styles.description}>{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
