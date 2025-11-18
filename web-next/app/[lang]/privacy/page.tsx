import { notFound } from 'next/navigation'
import { getTranslations, type Translations } from '@/lib/translations'
import LanguageSelector from '@/components/LanguageSelector'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import styles from './page.module.css'

const languages = ['es', 'en']

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
    title: `${t.privacy.title} | Avocados Amandi`,
    description: isSpanish 
      ? 'Política de privacidad de Avocados Amandi. Información sobre cómo recopilamos, usamos y protegemos tus datos personales.'
      : 'Privacy Policy of Avocados Amandi. Information about how we collect, use, and protect your personal data.',
  }
}

export default async function PrivacyPage({ 
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

  return (
    <>
      <LanguageSelector />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t.privacy.title}</h1>
          <p className={styles.lastUpdated}>
            {t.privacy.lastUpdated}: {new Date().toLocaleDateString(langValue === 'es' ? 'es-ES' : 'en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className={styles.section}>
            <p className={styles.introduction}>{t.privacy.introduction}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.privacy.dataCollection.title}</h2>
            <p className={styles.description}>{t.privacy.dataCollection.description}</p>
            <ul className={styles.list}>
              {t.privacy.dataCollection.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            <h3 className={styles.subsectionTitle}>{t.privacy.dataCollection.dataTypes.title}</h3>
            <ul className={styles.list}>
              <li><strong>{langValue === 'es' ? 'Información personal' : 'Personal information'}:</strong> {t.privacy.dataCollection.dataTypes.personal}</li>
              <li><strong>{langValue === 'es' ? 'Información de pago' : 'Payment information'}:</strong> {t.privacy.dataCollection.dataTypes.payment}</li>
              <li><strong>{langValue === 'es' ? 'Información de pedidos' : 'Order information'}:</strong> {t.privacy.dataCollection.dataTypes.order}</li>
              <li><strong>{langValue === 'es' ? 'Información técnica' : 'Technical information'}:</strong> {t.privacy.dataCollection.dataTypes.technical}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.privacy.dataUse.title}</h2>
            <ul className={styles.list}>
              {t.privacy.dataUse.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.privacy.dataSharing.title}</h2>
            <p className={styles.description}>{t.privacy.dataSharing.description}</p>
            <ul className={styles.list}>
              {t.privacy.dataSharing.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.privacy.dataSecurity.title}</h2>
            <p className={styles.description}>{t.privacy.dataSecurity.description}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.privacy.cookies.title}</h2>
            <p className={styles.description}>{t.privacy.cookies.description}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.privacy.yourRights.title}</h2>
            <p className={styles.description}>{t.privacy.yourRights.description}</p>
            <ul className={styles.list}>
              {t.privacy.yourRights.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.privacy.contact.title}</h2>
            <p className={styles.description}>{t.privacy.contact.description}</p>
            <p className={styles.email}>{t.privacy.contact.email}</p>
          </section>
        </div>
      </div>
      <Footer translations={t} />
    </>
  )
}

