import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CheckoutPage from '@/components/CheckoutPage'

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
      title: 'Shopping Cart | Avocados Amandi',
    }
  }

  return {
    title: resolvedParams.lang === 'es' 
      ? 'Carrito de compra | Avocados Amandi' 
      : 'Shopping Cart | Avocados Amandi',
    description: 'Review your order and complete checkout for premium organic avocados from Asturias.',
  }
}

export default async function Checkout({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  
  // Validate language
  if (!languages.includes(resolvedParams.lang)) {
    notFound()
  }
  
  return <CheckoutPage />
}

