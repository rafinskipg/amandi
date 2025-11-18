import { notFound } from 'next/navigation'
import ProductDetail from '@/components/ProductDetail'
import { getProductById, products } from '@/lib/products'
import { es, en, type Translations } from '@/lib/translations'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return products.map((product) => ({
    productId: product.id,
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: { productId: string } | Promise<{ productId: string }> 
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const product = getProductById(resolvedParams.productId)
  
  if (!product) {
    return {
      title: 'Product Not Found | Avocados Amandi',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.amandi.bio'
  const productImage = product.images && product.images.length > 0
    ? `${baseUrl}${product.images[0]}`
    : `${baseUrl}/brand.png`
  
  const productUrl = `${baseUrl}/shop/${resolvedParams.productId}`

  return {
    title: `${product.title.en} | Avocados Amandi`,
    description: product.description.en,
    openGraph: {
      title: `${product.title.en} | Avocados Amandi`,
      description: `${product.description.en} Price: €${product.price}`,
      url: productUrl,
      siteName: 'Avocados Amandi',
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.title.en,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title.en} | Avocados Amandi`,
      description: `${product.description.en} Price: €${product.price}`,
      images: [productImage],
    },
  }
}

export default async function ProductPage({ 
  params 
}: { 
  params: { productId: string } | Promise<{ productId: string }> 
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  const product = getProductById(resolvedParams.productId)
  
  if (!product) {
    notFound()
  }

  // Default to Spanish for now, can be made dynamic based on language
  const translations: Translations = es

  return (
    <div className="app">
      <ProductDetail product={product} translations={translations} />
    </div>
  )
}


