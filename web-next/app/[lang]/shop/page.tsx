import { notFound } from 'next/navigation'
import ShopPage from '@/components/ShopPage'
import { es, en, type Translations } from '@/lib/translations'
import type { Metadata } from 'next'

const languages = ['es', 'en', 'pt', 'fr', 'de', 'nl', 'da', 'sv', 'fi', 'no']

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
    return {
      title: 'Shop | Avocados Amandi',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.amandi.bio'
  const isSpanish = resolvedParams.lang === 'es'
  const pageUrl = `${baseUrl}/${resolvedParams.lang}/shop`
  const ogImage = `${baseUrl}/brand.png`
  const title = isSpanish ? 'Tienda | Avocados Amandi' : 'Shop | Avocados Amandi'
  const description = isSpanish
    ? 'Descubre todos nuestros productos: aguacates ecológicos, productos artesanales y productos locales de Asturias.'
    : 'Discover all our products: organic avocados, artisan goods, and local produce from Asturias.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Avocados Amandi',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Avocados Amandi Shop',
        },
      ],
      locale: isSpanish ? 'es_ES' : 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Shop({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  
  // Validate language
  if (!languages.includes(resolvedParams.lang)) {
    notFound()
  }
  
  // Detect language and use appropriate translations
  const lang = resolvedParams.lang === 'es' ? 'es' : 'en'
  const translations: Translations = lang === 'es' ? es : en

  return (
    <div className="app">
      <ShopPage translations={translations} />
    </div>
  )
}

