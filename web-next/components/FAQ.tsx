'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import type { CountryConfig } from '@/lib/countries'
import styles from './FAQ.module.css'

interface Props {
  translations: Translations
  country?: CountryConfig
}

export default function FAQ({ translations }: Props) {
  const t = translations.faq
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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

          <div className={styles.list}>
            {t.items.map((item, index) => (
              <motion.div
                key={index}
                className={`${styles.item} ${openIndex === index ? styles.open : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <button
                  className={styles.question}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className={styles.toggle}>{openIndex === index ? '−' : '+'}</span>
                </button>
                {openIndex === index && (
                  <div className={styles.answer}>
                    <p>{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
