import type { Metadata } from 'next'
import CheckoutPage from '@/components/CheckoutPage'

export const metadata: Metadata = {
  title: 'Shopping Cart | Avocados Amandi',
  description: 'Review your order and complete checkout for premium organic avocados from Asturias.',
}

export default function Checkout() {
  return <CheckoutPage />
}
