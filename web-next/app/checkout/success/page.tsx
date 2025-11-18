import { Suspense } from 'react'
import type { Metadata } from 'next'
import CheckoutSuccess from '@/components/CheckoutSuccess'

export const metadata: Metadata = {
  title: 'Pedido completado - Avocados Amandi',
  description: 'Gracias por tu pedido. Te enviaremos un correo de confirmación pronto.',
}

export default function CheckoutSuccessPage() {
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
      <CheckoutSuccess />
    </Suspense>
  )
}

