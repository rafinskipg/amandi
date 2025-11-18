import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import TrackOrder from '@/components/TrackOrder'

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
      ? 'Rastrear mi pedido - Avocados Amandi'
      : 'Track my order - Avocados Amandi',
    description: isSpanish
      ? 'Ingresa tu número de pedido para ver el estado y los detalles de tu orden.'
      : 'Enter your order number to view the status and details of your order.',
  }
}

export default function TrackOrderPage({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}) {
  return <TrackOrder />
}

