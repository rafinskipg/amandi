import type { Metadata } from 'next'
import CheckoutCancel from '@/components/CheckoutCancel'

export const metadata: Metadata = {
  title: 'Pago cancelado - Avocados Amandi',
}

export default function CheckoutCancelPage() {
  return <CheckoutCancel />
}

