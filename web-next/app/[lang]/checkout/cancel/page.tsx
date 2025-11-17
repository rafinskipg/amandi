import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CheckoutCancel from '@/components/CheckoutCancel'

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
    notFound()
  }

  const isSpanish = resolvedParams.lang === 'es'

  return {
    title: isSpanish 
      ? 'Pago cancelado - Avocados Amandi'
      : 'Payment cancelled - Avocados Amandi',
  }
}

export default function CheckoutCancelPage({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}) {
  const resolvedParams = params instanceof Promise ? params : Promise.resolve(params)
  
  return <CheckoutCancel params={resolvedParams} />
}

