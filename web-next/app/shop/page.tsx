import { notFound } from 'next/navigation'
import ShopPage from '@/components/ShopPage'
import { es, en, type Translations } from '@/lib/translations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop | Avocados Amandi',
  description: 'Discover all our products: organic avocados, artisan goods, and local produce from Asturias.',
}

export default function Shop() {
  // Default to Spanish for now, can be made dynamic based on language
  const translations: Translations = es

  return (
    <div className="app">
      <ShopPage translations={translations} />
    </div>
  )
}


