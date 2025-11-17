'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { es } from '@/lib/translations'
import { buildShopRoute, buildProductRoute } from '@/lib/routes'
import type { AvocadoVariety } from '@/lib/varieties'
import LanguageSelector from './LanguageSelector'
import ProductImage from './ProductImage'
import styles from './CheckoutPage.module.css'

export default function CheckoutPage() {
  const pathname = usePathname()
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()

  // Detect language
  const langMatch = pathname.match(/^\/(en|es)/)
  const lang = (langMatch ? langMatch[1] : 'es') as 'es' | 'en'
  const isSpanish = lang === 'es'

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getProductTitle = (product: any) => {
    return product.title?.[lang] || product.title?.en || 'Product'
  }

  const total = getTotalPrice()

  const handleQuantityChange = (productId: string, newQuantity: number, variety?: AvocadoVariety) => {
    if (newQuantity < 1) {
      removeFromCart(productId, variety)
    } else {
      updateQuantity(productId, newQuantity, variety)
    }
  }

  const getVarietyDisplayName = (variety?: AvocadoVariety): string => {
    if (!variety) return ''
    const isSpanish = lang === 'es'
    if (variety === 'hass') {
      return isSpanish ? 'Hass' : 'Hass'
    }
    return isSpanish ? 'Lamb Hass' : 'Lamb Hass'
  }

  const handleCompleteCheckout = () => {
    // TODO: Navigate to payment/checkout flow
    alert(isSpanish 
      ? 'Redirigiendo al proceso de pago...' 
      : 'Redirecting to payment process...'
    )
  }

  return (
    <>
      <LanguageSelector />
      <section className={styles.section}>
        <div className="container">
          <h1 className={styles.title}>
            {isSpanish ? 'Carrito de compra' : 'Shopping Cart'}
          </h1>

          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}>🛒</div>
              <h2 className={styles.emptyTitle}>
                {isSpanish ? 'Tu carrito está vacío' : 'Your cart is empty'}
              </h2>
              <p className={styles.emptyText}>
                {isSpanish 
                  ? 'Agrega productos desde nuestra tienda para comenzar.'
                  : 'Add products from our shop to get started.'
                }
              </p>
              <Link href={buildShopRoute(pathname)} className={styles.shopButton}>
                {isSpanish ? 'Ir a la tienda' : 'Go to shop'}
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.cartContent}>
                <div className={styles.itemsList}>
                  {items.map((item, index) => {
                    const product = item.product
                    const variety = item.variety
                    const title = getProductTitle(product)
                    const itemPrice = product.price > 0 ? product.price : 0
                    const itemTotal = itemPrice * item.quantity
                    const isAvocadoBox = product.category === 'avocados' && product.type === 'box' && product.id !== 'subscription'
                    const uniqueKey = variety ? `${product.id}-${variety}-${index}` : `${product.id}-${index}`

                    return (
                      <div key={uniqueKey} className={styles.cartItem}>
                        <Link 
                          href={buildProductRoute(pathname, product.id)}
                          className={styles.itemImageLink}
                        >
                          <div className={styles.itemImage}>
                            {product.images && product.images.length > 0 ? (
                              <ProductImage
                                src={product.images[0]}
                                alt={title}
                                fallbackIcon={product.icon}
                                fill
                              />
                            ) : product.icon ? (
                              <div className={styles.itemIcon}>{product.icon}</div>
                            ) : null}
                          </div>
                        </Link>

                        <div className={styles.itemDetails}>
                          <Link 
                            href={buildProductRoute(pathname, product.id)}
                            className={styles.itemTitleLink}
                          >
                            <h3 className={styles.itemTitle}>
                              {title}
                              {isAvocadoBox && variety && (
                                <span className={styles.varietyBadge}> - {getVarietyDisplayName(variety)}</span>
                              )}
                            </h3>
                          </Link>
                          {product.unit && (
                            <p className={styles.itemUnit}>
                              {isSpanish ? 'Unidad' : 'Unit'}: {product.unit}
                            </p>
                          )}
                          {itemPrice > 0 ? (
                            <p className={styles.itemPrice}>
                              {formatPrice(itemPrice, product.currency)} {product.unit ? `/${product.unit}` : ''}
                            </p>
                          ) : (
                            <p className={styles.itemPrice}>
                              {isSpanish ? 'Precio a consultar' : 'Price on request'}
                            </p>
                          )}
                        </div>

                        <div className={styles.itemQuantity}>
                          <label className={styles.quantityLabel}>
                            {isSpanish ? 'Cantidad' : 'Quantity'}
                          </label>
                          <div className={styles.quantityControls}>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleQuantityChange(product.id, item.quantity - 1, variety)}
                              aria-label={isSpanish ? 'Reducir cantidad' : 'Decrease quantity'}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1
                                handleQuantityChange(product.id, newQty, variety)
                              }}
                              className={styles.quantityInput}
                            />
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleQuantityChange(product.id, item.quantity + 1, variety)}
                              aria-label={isSpanish ? 'Aumentar cantidad' : 'Increase quantity'}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className={styles.itemTotal}>
                          {itemPrice > 0 ? (
                            <p className={styles.itemTotalPrice}>
                              {formatPrice(itemTotal, product.currency)}
                            </p>
                          ) : (
                            <p className={styles.itemTotalPrice}>—</p>
                          )}
                        </div>

                        <button
                          className={styles.removeButton}
                          onClick={() => removeFromCart(product.id, variety)}
                          aria-label={isSpanish ? 'Eliminar producto' : 'Remove product'}
                          title={isSpanish ? 'Eliminar' : 'Remove'}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className={styles.summary}>
                  <div className={styles.summaryCard}>
                    <h2 className={styles.summaryTitle}>
                      {isSpanish ? 'Resumen del pedido' : 'Order Summary'}
                    </h2>
                    
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        {isSpanish ? 'Subtotal' : 'Subtotal'}
                      </span>
                      <span className={styles.summaryValue}>
                        {formatPrice(total)}
                      </span>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        {isSpanish ? 'Envío' : 'Shipping'}
                      </span>
                      <span className={styles.summaryValue}>
                        {isSpanish ? 'Se calculará al finalizar' : 'Calculated at checkout'}
                      </span>
                    </div>

                    <div className={styles.summaryDivider}></div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryTotalLabel}>
                        {isSpanish ? 'Total' : 'Total'}
                      </span>
                      <span className={styles.summaryTotalValue}>
                        {formatPrice(total)}
                      </span>
                    </div>

                    <button
                      onClick={handleCompleteCheckout}
                      className={styles.checkoutButton}
                      disabled={items.length === 0}
                    >
                      {isSpanish ? 'Completar pedido' : 'Complete order'}
                    </button>

                    <Link href={buildShopRoute(pathname)} className={styles.continueShopping}>
                      {isSpanish ? '← Continuar comprando' : '← Continue shopping'}
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

