'use client'

import Image from 'next/image'
import styles from './Hero.module.css'

interface HeroProps {
  translations?: any
  country?: any
}

export default function Hero({ translations, country }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <Image
          src="/assets/banner-home.png"
          alt="Amandi"
          width={1920}
          height={600}
          className={styles.bannerHome}
          priority
        />
      </div>
    </section>
  )
}
