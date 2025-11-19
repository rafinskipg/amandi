'use client'

import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Translations } from '@/lib/translations'
import type { Product, SupportedLanguage } from '@/lib/products'
import { getRelatedProducts, getProductText, getProductFeatures } from '@/lib/products'
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
  
  // Detect language from pathname - support all languages
  const langMatch = pathname.match(/^\/(es|en|pt|fr|de|nl|da|sv|fi|no)/)
  const lang = (langMatch ? langMatch[1] : 'en') as SupportedLanguage
  
  // Get translations text
  const t = translations.productDetail || translations.shop || { selectVariety: '', varietyHass: '', varietyLambHass: '', inSeason: '', outOfSeason: '', reserveAvailable: '', productionDates: '', reservationNote: '' }
  const shopT = translations.shop || { title: '', subtitle: '', description: '', viewAll: '', addToCart: '', inStock: '', outOfStock: '' }

  // Check if this is an avocado box that needs variety selection
  const isAvocadoBox = product.category === 'avocados' && product.type === 'box' && product.id !== 'subscription'
  const [selectedVariety, setSelectedVariety] = useState<AvocadoVariety>(getDefaultVariety())

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const relatedProducts = getRelatedProducts(product.id, 4)

  const title = getProductText(product, lang, 'title')
  let description = getProductText(product, lang, 'description')
  
  // Add production dates to description for avocado boxes
  if (isAvocadoBox) {
    const variedadesT = translations.variedades
    const hassDates = variedadesT.hass.temporada
    const lambHassDates = variedadesT.lambHass.temporada
    const productionDatesLabel = t.productionDates || (lang === 'es' ? 'Fechas de producción' : 'Production dates')
    const reservationNote = t.reservationNote || ''
    
    description += ` ${productionDatesLabel}: Hass (${hassDates}), Lamb Hass (${lambHassDates}). ${reservationNote}`
  }
  
  const features = getProductFeatures(product, lang)

  const formatPrice = (price: number, currency: string = 'EUR') => {
    const localeMap: Record<SupportedLanguage, string> = {
      es: 'es-ES',
      en: 'en-GB',
      pt: 'pt-PT',
      fr: 'fr-FR',
      de: 'de-DE',
      nl: 'nl-NL',
      da: 'da-DK',
      sv: 'sv-SE',
      fi: 'fi-FI',
      no: 'no-NO',
    }
    return new Intl.NumberFormat(localeMap[lang] || 'en-GB', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getProductTitle = (p: Product) => {
    return getProductText(p, lang, 'title')
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
            <Link href={buildShopRoute(pathname)}>{lang === 'es' ? 'Tienda' : lang === 'fr' ? 'Boutique' : lang === 'pt' ? 'Loja' : lang === 'de' ? 'Shop' : 'Shop'}</Link>
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
                    {translations.checkout?.priceOnRequest || (lang === 'es' ? 'Precio a consultar' : 'Price on request')}
                  </span>
                )}
              </div>

              {product.inStock && (
                <div className={styles.stockStatus}>
                  <span className={styles.inStock}>
                    ✓ {shopT.inStock || (lang === 'es' ? 'En stock' : 'In stock')}
                  </span>
                </div>
              )}

              <div className={styles.description}>
                <h2>{lang === 'es' ? 'Descripción' : lang === 'fr' ? 'Description' : lang === 'pt' ? 'Descrição' : lang === 'de' ? 'Beschreibung' : lang === 'nl' ? 'Beschrijving' : lang === 'da' ? 'Beskrivelse' : lang === 'sv' ? 'Beskrivning' : lang === 'fi' ? 'Kuvaus' : lang === 'no' ? 'Beskrivelse' : 'Description'}</h2>
                <p>{description}</p>
              </div>

              {features.length > 0 && (
                <div className={styles.features}>
                  <h2>{lang === 'es' ? 'Características' : lang === 'fr' ? 'Caractéristiques' : lang === 'de' ? 'Eigenschaften' : lang === 'pt' ? 'Características' : 'Features'}</h2>
                  <ul>
                    {features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isAvocadoBox && (
                <div className={styles.varietySelector}>
                  <h2>{t.selectVariety || (lang === 'es' ? 'Selecciona la variedad' : 'Select variety')}</h2>
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
                                ? (t.inSeason || (lang === 'es' ? 'En temporada' : 'In season'))
                                : (t.outOfSeason || (lang === 'es' ? 'Fuera de temporada' : 'Out of season'))
                              }
                            </span>
                          </div>
                          {!isInSeason && (
                            <span className={styles.reserveNote}>
                              {t.reserveAvailable || (lang === 'es' ? 'Puedes reservarlo' : 'You can reserve it')}
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
                  {translations.checkout?.completeOrder ? translations.checkout.completeOrder.replace('order', 'now') : (lang === 'es' ? 'Comprar ahora' : lang === 'fr' ? 'Acheter maintenant' : lang === 'pt' ? 'Comprar agora' : lang === 'de' ? 'Jetzt kaufen' : 'Buy now')}
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
                      {shopT.addToCart || (lang === 'es' ? 'Añadir al carrito' : lang === 'fr' ? 'Ajouter au panier' : lang === 'pt' ? 'Adicionar ao carrinho' : lang === 'de' ? 'In den Warenkorb' : 'Add to cart')}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className={styles.viewCartLink}>
                <Link href={buildCheckoutRoute(pathname)} className={styles.viewCart}>
                  {lang === 'es' ? 'Ver carrito' : lang === 'fr' ? 'Voir le panier' : lang === 'pt' ? 'Ver carrinho' : lang === 'de' ? 'Warenkorb anzeigen' : 'View cart'}
                </Link>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className={styles.relatedSection}>
              <h2 className={styles.relatedTitle}>
                {product.type === 'box' 
                  ? (lang === 'es' ? 'También te puede interesar' : lang === 'fr' ? 'Vous pourriez aussi aimer' : lang === 'pt' ? 'Também pode interessar' : lang === 'de' ? 'Das könnte Sie auch interessieren' : 'You may also like')
                  : (lang === 'es' ? 'Productos relacionados' : lang === 'fr' ? 'Produits connexes' : lang === 'pt' ? 'Produtos relacionados' : lang === 'de' ? 'Verwandte Produkte' : 'Related products')
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

