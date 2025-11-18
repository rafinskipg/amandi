import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import CheckoutSuccess from '@/components/CheckoutSuccess'

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
      ? 'Pedido completado - Avocados Amandi'
      : 'Order completed - Avocados Amandi',
    description: isSpanish
      ? 'Gracias por tu pedido. Te enviaremos un correo de confirmación pronto.'
      : 'Thank you for your order. We will send you a confirmation email shortly.',
  }
}

export default function CheckoutSuccessPage({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}) {
  const resolvedParams = params instanceof Promise ? params : Promise.resolve(params)
  
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    }>
      <CheckoutSuccess params={resolvedParams} />
    </Suspense>
  )
}

