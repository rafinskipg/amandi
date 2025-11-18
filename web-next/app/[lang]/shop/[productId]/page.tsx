import { notFound } from 'next/navigation'
import ProductDetail from '@/components/ProductDetail'
import { getProductById, products } from '@/lib/products'
import { getTranslations, es, type Translations } from '@/lib/translations'
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

  // Use getTranslations to determine if Spanish, otherwise default to English
  const translations = getTranslations(resolvedParams.lang)
  const lang = translations === es ? 'es' : 'en'
  const title = product.title[lang] || product.title.en
  const description = product.description[lang] || product.description.en
  
  // Get product image URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.amandi.bio'
  const productImage = product.images && product.images.length > 0
    ? `${baseUrl}${product.images[0]}`
    : `${baseUrl}/brand.png` // Fallback to brand logo
  
  const productUrl = `${baseUrl}/${resolvedParams.lang}/shop/${resolvedParams.productId}`
  
  // Format price for display
  const priceText = lang === 'es'
    ? `${product.price}€`
    : `€${product.price}`

  return {
    title: `${title} | Avocados Amandi`,
    description,
    openGraph: {
      title: `${title} | Avocados Amandi`,
      description: `${description} ${lang === 'es' ? 'Precio:' : 'Price:'} ${priceText}`,
      url: productUrl,
      siteName: 'Avocados Amandi',
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: lang === 'es' ? 'es_ES' : 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Avocados Amandi`,
      description: `${description} ${lang === 'es' ? 'Precio:' : 'Price:'} ${priceText}`,
      images: [productImage],
    },
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

  // Detect language and use appropriate translations (defaults to English if not Spanish)
  const translations: Translations = getTranslations(resolvedParams.lang)

  return (
    <div className="app">
      <ProductDetail product={product} translations={translations} />
    </div>
  )
}

