'use client'

import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Translations } from '@/lib/translations'
import type { Product } from '@/lib/products'
import { getRelatedProducts } from '@/lib/products'
import { es } from '@/lib/translations'
import { useCart } from '@/context/CartContext'
import { buildShopRoute, buildProductRoute, buildCheckoutRoute } from '@/lib/routes'
import { getDefaultVariety, isVarietyInSeason, getSeasonDescription, type AvocadoVariety } from '@/lib/varieties'
import LanguageSelector from './LanguageSelector'
import ProductImage from './ProductImage'
import Image from 'next/image'
import styles from './ProductDetail.module.css'

interface Props {
  product: Product
  translations: Translations
}

export default function ProductDetail({ product, translations }: Props) {
  const pathname = usePathname()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { addToCart } = useCart()
  
  // Detect language
  const langMatch = pathname.match(/^\/(en|es)/)
  const lang = (langMatch ? langMatch[1] : 'es') as 'es' | 'en'
  const isSpanish = lang === 'es' || translations === es

  // Check if this is an avocado box that needs variety selection
  const isAvocadoBox = product.category === 'avocados' && product.type === 'box' && product.id !== 'subscription'
  const [selectedVariety, setSelectedVariety] = useState<AvocadoVariety>(getDefaultVariety())

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const relatedProducts = getRelatedProducts(product.id, 4)

  const title = product.title[lang] || product.title.en
  let description = product.description[lang] || product.description.en
  
  // Add production dates to description for avocado boxes
  if (isAvocadoBox) {
    const t = translations.variedades
    const hassDates = t.hass.temporada
    const lambHassDates = t.lambHass.temporada
    const reservationNote = translations.productDetail?.reservationNote || ''
    
    if (lang === 'es') {
      description += ` ${translations.productDetail?.productionDates || 'Fechas de producción'}: Hass (${hassDates}), Lamb Hass (${lambHassDates}). ${reservationNote}`
    } else {
      description += ` ${translations.productDetail?.productionDates || 'Production dates'}: Hass (${hassDates}), Lamb Hass (${lambHassDates}). ${reservationNote}`
    }
  }
  
  const features = product.features ? (product.features[lang] || product.features.en || []) : []

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getProductTitle = (p: Product) => {
    return p.title[lang] || p.title.en
  }

  const handleCheckout = async () => {
    // Add product to cart first
    if (isAvocadoBox) {
      addToCart(product, 1, selectedVariety)
    } else {
      addToCart(product, 1)
    }
    
    // Track add-to-cart event
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'add_to_cart',
          productId: product.id,
          productName: title,
          quantity: 1,
          variety: isAvocadoBox ? selectedVariety : undefined,
        }),
      })
    } catch (error) {
      console.error('Failed to track add-to-cart event:', error)
    }
    
    // Then redirect to checkout
    const checkoutBase = buildCheckoutRoute(pathname)
    window.location.href = checkoutBase
  }

  const handleAddToCart = async () => {
    if (isAnimating) return // Prevent multiple clicks during animation
    
    // Add to cart immediately
    if (isAvocadoBox) {
      addToCart(product, 1, selectedVariety)
    } else {
      addToCart(product, 1)
    }
    
    // Track add-to-cart event
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'add_to_cart',
          productId: product.id,
          productName: title,
          quantity: 1,
          variety: isAvocadoBox ? selectedVariety : undefined,
        }),
      })
    } catch (error) {
      console.error('Failed to track add-to-cart event:', error)
    }
    
    setIsAnimating(true)
    setLoadingProgress(0)

    // Quick subtle animation for feedback
    const duration = 400 // 400ms for quick feedback
    const startTime = Date.now()
    
    const animateLoading = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      setLoadingProgress(progress)

      if (progress < 100) {
        requestAnimationFrame(animateLoading)
      } else {
        // Trigger confetti from button position
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          const x = (rect.left + rect.width / 2) / window.innerWidth
          const y = (rect.top + rect.height / 2) / window.innerHeight
          
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { x, y },
            colors: ['#0f6a3c', '#f7c95a', '#f38a30', '#1a8449', '#ffd95f'],
            gravity: 0.8,
            ticks: 100
          })
        }

        // Reset after animation
        setTimeout(() => {
          setIsAnimating(false)
          setLoadingProgress(0)
        }, 500)
      }
    }

    requestAnimationFrame(animateLoading)
  }

  // Check if banner exists for this product
  // List of product IDs that have specific custom banners
  const productsWithSpecificBanners = ['lemons', 'honey', 'hazelnuts']
  // Products that use general category banners
  const isAvocadoBoxForBanner = product.category === 'avocados' && product.type === 'box'
  
  // Determine banner path
  let bannerPath: string | null = null
  if (productsWithSpecificBanners.includes(product.id)) {
    bannerPath = `/assets/banners/${product.id}.png`
  } else if (isAvocadoBoxForBanner) {
    bannerPath = `/assets/banners/avocado.png`
  }
  
  const hasBanner = bannerPath !== null

  return (
    <>
      <LanguageSelector />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href={buildShopRoute(pathname)}>{isSpanish ? 'Tienda' : 'Shop'}</Link>
            <span> / </span>
            <span>{title}</span>
          </div>

          <div className={styles.productLayout}>
            {/* Images */}
            <div className={styles.imagesSection}>
              <div className={styles.mainImage}>
                {product.images && product.images.length > 0 ? (
                  <ProductImage
                    src={product.images[selectedImageIndex]}
                    alt={title}
                    fallbackIcon={product.icon}
                    className={styles.mainImageImg}
                    fill
                  />
                ) : product.icon ? (
                  <div className={styles.iconFallback}>
                    {product.icon}
                  </div>
                ) : null}
              </div>
              {product.images && product.images.length > 1 && (
                <div className={styles.thumbnailGrid}>
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`${styles.thumbnail} ${selectedImageIndex === index ? styles.thumbnailActive : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <ProductImage
                        src={image}
                        alt={`${title} ${index + 1}`}
                        fallbackIcon={product.icon}
                        fill
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className={styles.infoSection}>
              {hasBanner && bannerPath && (
                <div className={styles.bannerContainer}>
                  <Image
                    src={bannerPath}
                    alt={title}
                    width={800}
                    height={200}
                    className={styles.banner}
                  />
                </div>
              )}
              <h1 className={styles.title}>{title}</h1>
              
              <div className={styles.priceSection}>
                {product.price > 0 ? (
                  <>
                    <span className={styles.price}>
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.unit && (
                      <span className={styles.unit}>/{product.unit}</span>
                    )}
                  </>
                ) : (
                  <span className={styles.priceFrom}>
                    {isSpanish ? 'Precio a consultar' : 'Price on request'}
                  </span>
                )}
              </div>

              {product.inStock && (
                <div className={styles.stockStatus}>
                  <span className={styles.inStock}>
                    ✓ {isSpanish ? 'En stock' : 'In stock'}
                  </span>
                </div>
              )}

              <div className={styles.description}>
                <h2>{isSpanish ? 'Descripción' : 'Description'}</h2>
                <p>{description}</p>
              </div>

              {features.length > 0 && (
                <div className={styles.features}>
                  <h2>{isSpanish ? 'Características' : 'Features'}</h2>
                  <ul>
                    {features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isAvocadoBox && (
                <div className={styles.varietySelector}>
                  <h2>{translations.productDetail?.selectVariety || (isSpanish ? 'Selecciona la variedad' : 'Select variety')}</h2>
                  <div className={styles.varietyOptions}>
                    {(['hass', 'lamb-hass'] as AvocadoVariety[]).map((variety) => {
                      const isInSeason = isVarietyInSeason(variety)
                      const isSelected = selectedVariety === variety
                      const varietyName = variety === 'hass' 
                        ? (translations.productDetail?.varietyHass || 'Hass')
                        : (translations.productDetail?.varietyLambHass || 'Lamb Hass')
                      
                      return (
                        <button
                          key={variety}
                          className={`${styles.varietyOption} ${isSelected ? styles.varietySelected : ''} ${!isInSeason ? styles.varietyOutOfSeason : ''}`}
                          onClick={() => setSelectedVariety(variety)}
                          disabled={false}
                        >
                          <div className={styles.varietyHeader}>
                            <span className={styles.varietyName}>{varietyName}</span>
                            <span className={`${styles.varietyStatus} ${isInSeason ? styles.inSeason : styles.outOfSeason}`}>
                              {isInSeason 
                                ? (translations.productDetail?.inSeason || (isSpanish ? 'En temporada' : 'In season'))
                                : (translations.productDetail?.outOfSeason || (isSpanish ? 'Fuera de temporada' : 'Out of season'))
                              }
                            </span>
                          </div>
                          {!isInSeason && (
                            <span className={styles.reserveNote}>
                              {translations.productDetail?.reserveAvailable || (isSpanish ? 'Puedes reservarlo' : 'You can reserve it')}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <button onClick={handleCheckout} className={styles.checkoutButton}>
                  {isSpanish ? 'Comprar ahora' : 'Buy now'}
                </button>
                <div className={styles.addToCartWrapper}>
                  <button 
                    ref={buttonRef}
                    onClick={handleAddToCart} 
                    className={`${styles.addToCartButton} ${isAnimating ? styles.animating : ''}`}
                    disabled={isAnimating}
                  >
                    {isAnimating && (
                      <div 
                        className={styles.loadingBarBg}
                        style={{ width: `${loadingProgress}%` }}
                      />
                    )}
                    <span className={styles.buttonText}>
                      {isSpanish ? 'Añadir al carrito' : 'Add to cart'}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className={styles.viewCartLink}>
                <Link href={buildCheckoutRoute(pathname)} className={styles.viewCart}>
                  {isSpanish ? 'Ver carrito' : 'View cart'}
                </Link>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className={styles.relatedSection}>
              <h2 className={styles.relatedTitle}>
                {product.type === 'box' 
                  ? (isSpanish ? 'También te puede interesar' : 'You may also like')
                  : (isSpanish ? 'Productos relacionados' : 'Related products')
                }
              </h2>
              <div className={styles.relatedGrid}>
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={buildProductRoute(pathname, relatedProduct.id)}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedImage}>
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <ProductImage
                          src={relatedProduct.images[0]}
                          alt={getProductTitle(relatedProduct)}
                          fallbackIcon={relatedProduct.icon}
                          fill
                        />
                      ) : relatedProduct.icon ? (
                        <div className={styles.relatedIcon}>
                          {relatedProduct.icon}
                        </div>
                      ) : null}
                    </div>
                    <h3>{getProductTitle(relatedProduct)}</h3>
                    {relatedProduct.price > 0 && (
                      <p className={styles.relatedPrice}>
                        {formatPrice(relatedProduct.price, relatedProduct.currency)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

