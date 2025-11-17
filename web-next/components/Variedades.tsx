'use client'

import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import type { CountryConfig } from '@/lib/countries'
import styles from './Variedades.module.css'

interface Props {
  translations: Translations
  country?: CountryConfig
}

export default function Variedades({ translations }: Props) {
  const t = translations.variedades

  return (
    <section id="variedades" className={styles.section}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t.title}</h2>
          <p className={styles.intro}>{t.intro}</p>

          <div className={styles.grid}>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.icon}>🥑</div>
              <h3 className={styles.name}>{t.hass.name}</h3>
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Floración:</span>
                  <span className={styles.detailValue}>{t.hass.floracion}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Engorde de fruto:</span>
                  <span className={styles.detailValue}>{t.hass.engorde}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Temporada de corte:</span>
                  <span className={styles.detailValue}>{t.hass.temporada}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Maduración en casa:</span>
                  <span className={styles.detailValue}>{t.hass.maduracion}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Notas de sabor:</span>
                  <span className={styles.detailValue}>{t.hass.sabor}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Perfecto para:</span>
                  <span className={styles.detailValue}>{t.hass.perfecto}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className={styles.icon}>🥑</div>
              <h3 className={styles.name}>{t.lambHass.name}</h3>
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Floración:</span>
                  <span className={styles.detailValue}>{t.lambHass.floracion}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Temporada de corte:</span>
                  <span className={styles.detailValue}>{t.lambHass.temporada}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Maduración en casa:</span>
                  <span className={styles.detailValue}>{t.lambHass.maduracion}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Notas de sabor:</span>
                  <span className={styles.detailValue}>{t.lambHass.sabor}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Perfecto para:</span>
                  <span className={styles.detailValue}>{t.lambHass.perfecto}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className={styles.calendarioSection}>
            <h3 className={styles.calendarioTitle}>Calendario</h3>
            <ul className={styles.calendarioList}>
              {t.calendario.map((item, index) => (
                <li key={index} className={styles.calendarioItem}>{item}</li>
              ))}
            </ul>
          </div>

          <p className={styles.microCopy}>{t.microCopy}</p>
        </motion.div>
      </div>
    </section>
  )
}
