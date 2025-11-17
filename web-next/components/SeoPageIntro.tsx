'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { CountryConfig } from '@/lib/countries'
import type { Translations } from '@/lib/translations'
import { getCountryTranslation } from '@/lib/countryTranslations'
import styles from './SeoPageIntro.module.css'

interface Props {
  translations: Translations
  country: CountryConfig
}

export default function SeoPageIntro({ translations, country }: Props) {
  const [imageError, setImageError] = useState(false)
  const countryT = getCountryTranslation(country.code)
  const imageSrc = imageError 
    ? '/assets/countries/demo.png' 
    : `/assets/countries/${country.code}.png`

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
            <h1 className={styles.title}>{countryT.seoIntro.title}</h1>
            <p className={styles.intro}>{countryT.seoIntro.intro}</p>
            
            <div className={styles.benefits}>
              {countryT.seoIntro.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className={styles.benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <span className={styles.benefitIcon}>✓</span>
                  <span className={styles.benefitText}>{benefit}</span>
                </motion.div>
              ))}
            </div>

            {country.customContent?.testimonial && (
              <motion.div
                className={styles.testimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className={styles.testimonialText}>"{country.customContent.testimonial.text}"</p>
                <p className={styles.testimonialName}>— {country.customContent.testimonial.name}, {country.name}</p>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className={styles.imageContainer}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={imageSrc}
                alt={`Avocados Amandi in ${country.name}`}
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
