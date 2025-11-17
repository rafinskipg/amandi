'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { buildCheckoutRoute } from '@/lib/routes'
import styles from './CartIcon.module.css'

export default function CartIcon() {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const itemCount = getTotalItems()

  return (
    <Link href={buildCheckoutRoute(pathname)} className={styles.cartIcon}>
      <span className={styles.cartIconSymbol}>🛒</span>
      {itemCount > 0 && (
        <span className={styles.cartBadge}>{itemCount}</span>
      )}
    </Link>
  )
}

