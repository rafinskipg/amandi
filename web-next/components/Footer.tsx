'use client'

import { usePathname } from 'next/navigation'
import { getAllSeoPaths } from '@/lib/countries'
import { specialSeoPages } from '@/lib/seoPages'
import type { CountryConfig } from '@/lib/countries'
import type { Translations } from '@/lib/translations'
import Link from 'next/link'
import styles from './Footer.module.css'

interface FooterProps {
  translations: Translations
  country?: CountryConfig
}

export default function Footer({ translations, country }: FooterProps) {
  const pathname = usePathname()
  const t = translations.footer
  const seoPaths = getAllSeoPaths()
  
  // Detect current language from pathname
  const currentLang = pathname.startsWith('/es/') ? 'es' : 'en'
  
  // Group SEO links by type
  const orderLinks = seoPaths.filter(p => p.type === 'order').slice(0, 6)
  const ecologicalLinks = seoPaths.filter(p => p.type === 'ecological').slice(0, 6)
  
  // Get maternity page path for current language
  const maternityPath = specialSeoPages['maternity']?.paths[currentLang]

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>{t.brand}</h3>
            <p className={styles.footerTagline}>{t.tagline}</p>
          </div>
          
          <div className={styles.footerLinks}>
            <h4 className={styles.footerLinksTitle}>Order Online</h4>
            {orderLinks.map(({ path, country }) => (
              <Link key={path} href={path}>
                Order avocados in {country.name}
              </Link>
            ))}
          </div>

          <div className={styles.footerLinks}>
            <h4 className={styles.footerLinksTitle}>Ecological Avocados</h4>
            {ecologicalLinks.map(({ path, country }) => (
              <Link key={path} href={path}>
                Ecological avocados in {country.name}
              </Link>
            ))}
          </div>

          {maternityPath && (
            <div className={styles.footerLinks}>
              <h4 className={styles.footerLinksTitle}>{translations.maternity?.title || 'For Pregnant Women & Babies'}</h4>
              <Link href={maternityPath}>
                {translations.maternity?.cta || 'Organic avocados for pregnant women and babies'}
              </Link>
            </div>
          )}

          <div className={styles.footerLegal}>
            <Link href="#">{t.links.privacy}</Link>
            <Link href="#">{t.links.shipping}</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>{t.tagline}</p>
        </div>
      </div>
    </footer>
  )
}

