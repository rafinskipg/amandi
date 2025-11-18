'use client'

import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import type { CountryConfig } from '@/lib/countries'
import styles from './VideoFinca.module.css'

interface Props {
  translations: Translations
  country?: CountryConfig
}

export default function VideoFinca({ translations }: Props) {
  const t = translations.videoFinca

  return (
    <section id="video-finca" className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          <motion.div
            className={styles.thumbnail}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.imageContainer}>
              <img
                src="/finca.jpeg"
                alt="Nuestra finca en Amandi"
                className={styles.fincaImage}
              />
            </div>
          </motion.div>

          <motion.div
            className={styles.content}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">{t.title}</h2>
            <p className={styles.copy}>{t.copy}</p>

            <div className={styles.highlights}>
              {t.highlights.map((highlight, index) => (
                <div key={index} className={styles.highlightItem}>
                  <span className={styles.highlightIcon}>{highlight.icon}</span>
                  <span className={styles.highlightText}>{highlight.text}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary">{t.cta}</button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
