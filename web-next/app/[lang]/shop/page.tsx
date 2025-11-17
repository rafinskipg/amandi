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

  return {
    title: resolvedParams.lang === 'es' ? 'Tienda | Avocados Amandi' : 'Shop | Avocados Amandi',
    description: 'Discover all our products: organic avocados, artisan goods, and local produce from Asturias.',
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

