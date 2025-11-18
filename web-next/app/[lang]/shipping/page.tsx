import { notFound } from 'next/navigation'
import { getTranslations, type Translations } from '@/lib/translations'
import { countries, type CountryCode } from '@/lib/countries'
import { shippingCosts } from '@/lib/shipping'
import LanguageSelector from '@/components/LanguageSelector'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import styles from './page.module.css'

const languages = ['es', 'en']

// Country flag emojis mapping
const countryFlags: Record<CountryCode, string> = {
  es: '🇪🇸',
  pt: '🇵🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  be: '🇧🇪',
  dk: '🇩🇰',
  nl: '🇳🇱',
  se: '🇸🇪',
  fi: '🇫🇮',
  no: '🇳🇴',
  gb: '🇬🇧',
}

export async function generateStaticParams() {
  return languages.map((lang) => ({
    lang,
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  
  if (!languages.includes(resolvedParams.lang)) {
    notFound()
  }

  const t: Translations = getTranslations(resolvedParams.lang as 'es' | 'en')
  const isSpanish = resolvedParams.lang === 'es'

  return {
    title: `${t.shipping.title} | Avocados Amandi`,
    description: isSpanish 
      ? 'Envíos de aguacates ecológicos a toda Europa. Entrega rápida desde Asturias a España, Portugal, Francia, Alemania y más países.'
      : 'Shipping organic avocados throughout Europe. Fast delivery from Asturias to Spain, Portugal, France, Germany and more countries.',
  }
}

export default async function ShippingPage({ 
  params 
}: { 
  params: Promise<{ lang: string }> | { lang: string }
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  const langValue = resolvedParams.lang
  
  if (!languages.includes(langValue)) {
    notFound()
  }

  const t: Translations = getTranslations(langValue as 'es' | 'en')
  const isSpanish = langValue === 'es'

  // Get all supported countries
  const supportedCountries = Object.values(countries).map(country => ({
    ...country,
    flag: countryFlags[country.code],
    shippingInfo: shippingCosts[country.code],
  }))

  return (
    <>
      <LanguageSelector />
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t.shipping.title}</h1>
            <p className={styles.heroSubtitle}>{t.shipping.subtitle}</p>
            <p className={styles.heroDescription}>{t.shipping.description}</p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefitsSection}>
          <div className={styles.content}>
            <h2 className={styles.sectionTitle}>{t.shipping.benefits.title}</h2>
            <div className={styles.benefitsGrid}>
              {t.shipping.benefits.items.map((benefit, index) => (
                <div key={index} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>{benefit.icon}</div>
                  <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                  <p className={styles.benefitDescription}>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Countries Section */}
        <section className={styles.countriesSection}>
          <div className={styles.content}>
            <h2 className={styles.sectionTitle}>{t.shipping.countries.title}</h2>
            <p className={styles.sectionDescription}>{t.shipping.countries.description}</p>
            <div className={styles.countriesGrid}>
              {supportedCountries.map((country) => (
                <div key={country.code} className={styles.countryCard}>
                  <div className={styles.countryFlag}>{country.flag}</div>
                  <h3 className={styles.countryName}>{country.name}</h3>
                  <div className={styles.countryInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{t.shipping.shippingInfo.deliveryTime}:</span>
                      <span className={styles.infoValue}>{country.shippingInfo.estimatedDays}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{t.shipping.shippingInfo.cost}:</span>
                      <span className={styles.infoValue}>
                        {country.shippingInfo.baseCost}€ - {country.shippingInfo.maxCost}€
                      </span>
                    </div>
                    {country.shippingInfo.freeShippingThreshold && (
                      <div className={styles.freeShipping}>
                        🎁 {isSpanish ? 'Envío gratis' : 'Free shipping'} {country.shippingInfo.freeShippingThreshold}€+
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shipping Info Section */}
        <section className={styles.infoSection}>
          <div className={styles.content}>
            <h2 className={styles.sectionTitle}>{t.shipping.shippingInfo.title}</h2>
            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <div className={styles.infoCardIcon}>📦</div>
                <h3 className={styles.infoCardTitle}>{t.shipping.shippingInfo.cost}</h3>
                <p className={styles.infoCardText}>
                  {isSpanish 
                    ? 'Calculado según el peso y destino. Envío gratis para pedidos superiores a 30€ en España.'
                    : 'Calculated based on weight and destination. Free shipping for orders over €30 in Spain.'}
                </p>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoCardIcon}>⏱️</div>
                <h3 className={styles.infoCardTitle}>{t.shipping.shippingInfo.deliveryTime}</h3>
                <p className={styles.infoCardText}>
                  {isSpanish 
                    ? '2-7 días laborables dependiendo del destino. Los pedidos se envían directamente desde nuestra finca en Asturias.'
                    : '2-7 business days depending on destination. Orders ship directly from our farm in Asturias.'}
                </p>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoCardIcon}>📧</div>
                <h3 className={styles.infoCardTitle}>{t.shipping.shippingInfo.tracking}</h3>
                <p className={styles.infoCardText}>
                  {isSpanish 
                    ? 'Recibirás un email con el número de seguimiento cuando tu pedido sea enviado.'
                    : 'You will receive an email with the tracking number when your order is shipped.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.content}>
            <Link href={`/${langValue}/shop`} className={styles.ctaButton}>
              {t.shipping.cta}
            </Link>
          </div>
        </section>
      </div>
      <Footer translations={t} />
    </>
  )
}

