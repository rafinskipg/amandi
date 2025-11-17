import { notFound } from 'next/navigation'
import ProductDetail from '@/components/ProductDetail'
import { getProductById, products } from '@/lib/products'
import { es, en, type Translations } from '@/lib/translations'
import type { Metadata } from 'next'

const languages = ['es', 'en', 'pt', 'fr', 'de', 'nl', 'da', 'sv', 'fi', 'no']

export async function generateStaticParams() {
  const productParams = products.map((product) => ({
    productId: product.id,
  }))
  
  // Generate params for all languages
  const params: Array<{ lang: string; productId: string }> = []
  languages.forEach(lang => {
    productParams.forEach(product => {
      params.push({ lang, ...product })
    })
  })
  
  return params
}

export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string; productId: string } | Promise<{ lang: string; productId: string }> 
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const product = getProductById(resolvedParams.productId)
  
  if (!product) {
    return {
      title: 'Product Not Found | Avocados Amandi',
    }
  }

  const lang = resolvedParams.lang === 'es' ? 'es' : 'en'
  const title = product.title[lang] || product.title.en
  const description = product.description[lang] || product.description.en

  return {
    title: `${title} | Avocados Amandi`,
    description,
  }
}

export default async function ProductPage({ 
  params 
}: { 
  params: { lang: string; productId: string } | Promise<{ lang: string; productId: string }> 
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  
  // Validate language
  if (!languages.includes(resolvedParams.lang)) {
    notFound()
  }
  
  const product = getProductById(resolvedParams.productId)
  
  if (!product) {
    notFound()
  }

  // Detect language and use appropriate translations
  const lang = resolvedParams.lang === 'es' ? 'es' : 'en'
  const translations: Translations = lang === 'es' ? es : en

  return (
    <div className="app">
      <ProductDetail product={product} translations={translations} />
    </div>
  )
}

