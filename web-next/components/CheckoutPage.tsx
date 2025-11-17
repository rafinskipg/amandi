'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { es, en, type Translations } from '@/lib/translations'
import { buildShopRoute, buildProductRoute } from '@/lib/routes'
import type { AvocadoVariety } from '@/lib/varieties'
import type { CountryCode } from '@/lib/countries'
import { calculateShippingCost, getShippingCost } from '@/lib/shipping'
import { countries } from '@/lib/countries'
import LanguageSelector from './LanguageSelector'
import ProductImage from './ProductImage'
import styles from './CheckoutPage.module.css'


export default function CheckoutPage() {
  const pathname = usePathname()
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalWeight, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  
  // Load selected country from localStorage or default to 'es'
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('amandi-selected-country')
      if (saved && Object.values(countries).some(c => c.code === saved)) {
        return saved as CountryCode
      }
    }
    return 'es'
  })
  
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  
  // Save country to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('amandi-selected-country', selectedCountry)
    }
  }, [selectedCountry])

  // Detect language
  const langMatch = pathname.match(/^\/(en|es)/)
  const lang = (langMatch ? langMatch[1] : 'es') as 'es' | 'en'
  const isSpanish = lang === 'es'
  const t: Translations = isSpanish ? es : en

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getProductTitle = (product: any) => {
    return product.title?.[lang] || product.title?.en || 'Product'
  }

  const subtotal = getTotalPrice()
  const totalWeight = getTotalWeight()
  const shippingCost = calculateShippingCost(selectedCountry, totalWeight, subtotal)
  const total = subtotal + shippingCost
  const shippingInfo = getShippingCost(selectedCountry)

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

  const handleCompleteCheckout = async () => {
    if (items.length === 0) return

    setIsLoading(true)

    try {
      // Track checkout started event
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'checkout_started',
            metadata: {
              itemCount: items.length,
              subtotal: subtotal,
              shippingCost: shippingCost,
              total: total,
            },
          }),
        })
      } catch (error) {
        console.error('Failed to track checkout_started event:', error)
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const successUrl = `${baseUrl}${pathname}/success?session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${baseUrl}${pathname}`

      // Validate country is selected
      if (!selectedCountry) {
        setCheckoutError(t.checkout.errors.required)
        setIsLoading(false)
        return
      }

      // Clear errors if validation passes
      setCheckoutError(null)

      // Only send product IDs, quantities, and varieties to reduce payload size
      const checkoutItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        variety: item.variety || undefined,
      }))

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: checkoutItems,
          country: selectedCountry,
          shippingCost,
          totalWeight,
          successUrl,
          cancelUrl,
          locale: lang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      setCheckoutError(`${t.checkout.errors.checkoutFailed}: ${error.message}`)
      setIsLoading(false)
    }
  }

  return (
    <>
      <LanguageSelector />
      <section className={styles.section}>
        <div className="container">
          <h1 className={styles.title}>
            {t.checkout.title}
          </h1>

          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}>🛒</div>
              <h2 className={styles.emptyTitle}>
                {t.checkout.emptyCart}
              </h2>
              <p className={styles.emptyText}>
                {t.checkout.emptyText}
              </p>
              <Link href={buildShopRoute(pathname)} className={styles.shopButton}>
                {t.checkout.goToShop}
              </Link>
            </div>
          ) : (
            <div className={styles.cartContent}>
              {/* Products List - Left Side */}
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
                              {t.checkout.unit}: {product.unit}
                            </p>
                          )}
                          {itemPrice > 0 ? (
                            <p className={styles.itemPrice}>
                              {formatPrice(itemPrice, product.currency)} {product.unit ? `/${product.unit}` : ''}
                            </p>
                          ) : (
                            <p className={styles.itemPrice}>
                              {t.checkout.priceOnRequest}
                            </p>
                          )}
                        </div>

                        <div className={styles.itemQuantity}>
                          <label className={styles.quantityLabel}>
                            {t.checkout.quantity}
                          </label>
                          <div className={styles.quantityControls}>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleQuantityChange(product.id, item.quantity - 1, variety)}
                              aria-label={t.checkout.decreaseQuantity}
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
                              aria-label={t.checkout.increaseQuantity}
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
                          aria-label={t.checkout.remove}
                          title={t.checkout.remove}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
              </div>

              {/* Summary and Country Selector - Right Side */}
              <div className={styles.summary}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.summaryTitle}>
                    {t.checkout.orderSummary}
                  </h2>
                  
                  {/* Country Selector */}
                  <div className={styles.countrySelector}>
                    <label className={styles.formLabel}>
                      {t.checkout.addressFields.country} *
                    </label>
                    <select
                      required
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                      className={styles.formSelect}
                    >
                      {Object.values(countries).map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {totalWeight > 0 && (
                      <p className={styles.weightInfo}>
                        {isSpanish ? 'Peso total' : 'Total weight'}: {totalWeight.toFixed(2)} kg
                      </p>
                    )}
                  </div>

                  <div className={styles.summaryDivider}></div>
                  
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>
                      {t.checkout.subtotal}
                    </span>
                    <span className={styles.summaryValue}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>
                      {t.checkout.shipping}
                    </span>
                    <span className={styles.summaryValue}>
                      {shippingCost > 0 ? (
                        <>
                          {formatPrice(shippingCost)}
                          <span className={styles.shippingDays}> ({shippingInfo.estimatedDays})</span>
                        </>
                      ) : (
                        <span className={styles.freeShipping}>
                          {isSpanish ? 'Envío gratis' : 'Free shipping'}
                        </span>
                      )}
                    </span>
                  </div>

                  {shippingInfo.freeShippingThreshold && subtotal < shippingInfo.freeShippingThreshold && (
                    <p className={styles.freeShippingNote}>
                      {isSpanish 
                        ? `Añade ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} más para envío gratis`
                        : `Add ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} more for free shipping`
                      }
                    </p>
                  )}

                  <div className={styles.summaryDivider}></div>

                  <div className={styles.summaryRow}>
                    <span className={styles.summaryTotalLabel}>
                      {t.checkout.total}
                    </span>
                    <span className={styles.summaryTotalValue}>
                      {formatPrice(total)}
                    </span>
                  </div>

                  {checkoutError && (
                    <div className={styles.checkoutError}>
                      <span className={styles.errorIcon}>⚠️</span>
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleCompleteCheckout}
                    className={styles.checkoutButton}
                    disabled={items.length === 0 || isLoading}
                  >
                    {isLoading ? t.checkout.processing : t.checkout.completeOrder}
                  </button>

                  <Link href={buildShopRoute(pathname)} className={styles.continueShopping}>
                    {t.checkout.continueShopping}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

