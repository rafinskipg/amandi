'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { getTranslations, es, type Translations } from '@/lib/translations'
import { buildShopRoute, buildProductRoute } from '@/lib/routes'
import type { AvocadoVariety } from '@/lib/varieties'
import { isVarietyInSeason, getSeasonDescription } from '@/lib/varieties'
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
  
  // Load selected country from localStorage, but don't default to anything
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | ''>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('amandi-selected-country')
      if (saved && Object.values(countries).some(c => c.code === saved)) {
        return saved as CountryCode
      }
    }
    return ''
  })
  
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  
  // Save country to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('amandi-selected-country', selectedCountry)
    }
  }, [selectedCountry])

  // Detect language - support all languages
  const langMatch = pathname.match(/^\/(es|en|pt|fr|de|nl|da|sv|fi|no)/)
  const lang = (langMatch ? langMatch[1] : 'en') as 'es' | 'en' | 'pt' | 'fr' | 'de' | 'nl' | 'da' | 'sv' | 'fi' | 'no'
  const t: Translations = getTranslations(lang)

  const formatPrice = (price: number, currency: string = 'EUR') => {
    const localeMap: Record<string, string> = {
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

  const getProductTitle = (product: any) => {
    return product.title?.[lang] || product.title?.en || product.title?.es || 'Product'
  }

  const subtotal = getTotalPrice()
  const totalWeight = getTotalWeight()
  
  // Check if subscription is in cart - it needs 2 shipments (hidden for now but keeping logic)
  const hasSubscription = items.some(item => item.product.id === 'subscription')
  const subscriptionShippingMultiplier = hasSubscription ? 2 : 1
  
  // Calculate shipping cost (multiply by 2 if subscription)
  const baseShippingCost = selectedCountry ? calculateShippingCost(selectedCountry, totalWeight, subtotal) : 0
  const shippingCost = baseShippingCost * subscriptionShippingMultiplier
  const total = subtotal + shippingCost
  const shippingInfo = selectedCountry ? getShippingCost(selectedCountry) : null

  // Check for season status and multi-variety orders
  const seasonWarnings = useMemo(() => {
    const warnings: Array<{ variety: AvocadoVariety; inSeason: boolean; season: string }> = []
    const hasHass = items.some(item => {
      const isBox = item.product.category === 'avocados' && item.product.type === 'box' && item.product.id !== 'subscription'
      return isBox && item.variety === 'hass'
    })
    const hasLambHass = items.some(item => {
      const isBox = item.product.category === 'avocados' && item.product.type === 'box' && item.product.id !== 'subscription'
      return isBox && item.variety === 'lamb-hass'
    })

    if (hasHass) {
      warnings.push({
        variety: 'hass',
        inSeason: isVarietyInSeason('hass'),
        season: getSeasonDescription('hass', lang === 'es' ? 'es' : 'en'),
      })
    }
    if (hasLambHass) {
      warnings.push({
        variety: 'lamb-hass',
        inSeason: isVarietyInSeason('lamb-hass'),
        season: getSeasonDescription('lamb-hass', lang === 'es' ? 'es' : 'en'),
      })
    }

    return warnings
  }, [items, lang])

  const hasMultipleVarieties = seasonWarnings.length === 2
  const hasOutOfSeasonBoxes = seasonWarnings.some(w => !w.inSeason)

  const handleQuantityChange = (productId: string, newQuantity: number, variety?: AvocadoVariety) => {
    if (newQuantity < 1) {
      removeFromCart(productId, variety)
    } else {
      updateQuantity(productId, newQuantity, variety)
    }
  }

  const getVarietyDisplayName = (variety?: AvocadoVariety): string => {
    if (!variety) return ''
    if (variety === 'hass') {
      return 'Hass'
    }
    return 'Lamb Hass'
  }

  const handleCompleteCheckout = async () => {
    if (items.length === 0) return
    
    if (!selectedCountry) {
      setCheckoutError(t.checkout.errors.selectCountry)
      return
    }

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
                  
                  {/* A little surprise row */}
                  <div className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      <div className={styles.surpriseIcon}>🎁</div>
                    </div>
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemTitle}>
                        {t.checkout.surprise.title}
                      </h3>
                      <p className={styles.itemUnit}>
                        {t.checkout.surprise.description}
                      </p>
                    </div>
                    <div className={styles.itemQuantity}></div>
                    <div className={styles.itemTotal}>
                      <p className={styles.itemTotalPrice}>—</p>
                    </div>
                    <div></div>
                  </div>
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
                      onChange={(e) => {
                        const country = e.target.value as CountryCode
                        setSelectedCountry(country)
                        setCheckoutError(null)
                      }}
                      className={styles.formSelect}
                    >
                      <option value="">{t.checkout.selectCountryPlaceholder}</option>
                      {Object.values(countries).map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.countryNote}>
                      <span className={styles.countryNoteIcon}>📍</span>
                      <span className={styles.countryNoteText}>
                        {t.checkout.countryNote}
                      </span>
                    </div>
                    {totalWeight > 0 && selectedCountry && (
                      <p className={styles.weightInfo}>
                        {t.checkout.totalWeight}: {totalWeight.toFixed(2)} kg
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

                  {selectedCountry && (
                    <>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>
                          {t.checkout.shipping}
                        </span>
                        <span className={styles.summaryValue}>
                          {shippingCost > 0 ? (
                            <>
                              {formatPrice(shippingCost)}
                              <span className={styles.shippingDays}> ({shippingInfo?.estimatedDays})</span>
                            </>
                          ) : (
                            <span className={styles.freeShipping}>
                              {t.checkout.freeShipping}
                            </span>
                          )}
                        </span>
                      </div>

                      {hasSubscription && (
                        <p className={styles.subscriptionShippingNote}>
                          {lang === 'es' ? 'La suscripción incluye 2 envíos (uno para cada temporada)' : lang === 'fr' ? 'L\'abonnement comprend 2 expéditions (une pour chaque saison)' : lang === 'pt' ? 'A subscrição inclui 2 envios (um para cada temporada)' : lang === 'de' ? 'Das Abonnement umfasst 2 Sendungen (eine für jede Saison)' : lang === 'nl' ? 'Het abonnement omvat 2 verzendingen (één voor elk seizoen)' : lang === 'da' ? 'Abonnementet inkluderer 2 forsendelser (én for hver sæson)' : lang === 'sv' ? 'Prenumerationen inkluderar 2 leveranser (en för varje säsong)' : lang === 'fi' ? 'Tilaus sisältää 2 lähetystä (yksi jokaiselle kaudelle)' : lang === 'no' ? 'Abonnementet inkluderer 2 forsendelser (én for hver sesong)' : 'Subscription includes 2 shipments (one for each season)'}
                        </p>
                      )}
                      {shippingInfo?.freeShippingThreshold && subtotal < shippingInfo.freeShippingThreshold && !hasSubscription && (
                        <p className={styles.freeShippingNote}>
                          {lang === 'es' ? `Añade ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} más para envío gratis` : lang === 'fr' ? `Ajoutez ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} de plus pour la livraison gratuite` : lang === 'pt' ? `Adicione ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} mais para envio grátis` : lang === 'de' ? `Fügen Sie ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} hinzu für kostenlosen Versand` : lang === 'nl' ? `Voeg ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} toe voor gratis verzending` : lang === 'da' ? `Tilføj ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} mere for gratis forsendelse` : lang === 'sv' ? `Lägg till ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} till för gratis leverans` : lang === 'fi' ? `Lisää ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} enemmän ilmaiseen toimitukseen` : lang === 'no' ? `Legg til ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} mer for gratis frakt` : `Add ${formatPrice(shippingInfo.freeShippingThreshold - subtotal)} more for free shipping`}
                        </p>
                      )}
                    </>
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

                  {/* Season warnings */}
                  {hasOutOfSeasonBoxes && (
                    <div className={styles.seasonWarning}>
                      <span className={styles.warningIcon}>📅</span>
                      <div className={styles.warningContent}>
                        <strong>{lang === 'es' ? 'Preorden - Fuera de temporada' : lang === 'fr' ? 'Précommande - Hors saison' : lang === 'pt' ? 'Pré-encomenda - Fora de temporada' : lang === 'de' ? 'Vorbestellung - Außerhalb der Saison' : lang === 'nl' ? 'Pre-order - Buiten het seizoen' : lang === 'da' ? 'Forudbestilling - Uden for sæsonen' : lang === 'sv' ? 'Förbeställning - Utanför säsongen' : lang === 'fi' ? 'Ennakkotilaus - Kauden ulkopuolella' : lang === 'no' ? 'Forhåndsbestilling - Utenfor sesongen' : 'Preorder - Out of season'}</strong>
                        <p>
                          {lang === 'es' ? 'Algunas cajas en tu pedido están fuera de temporada. Las enviaremos cuando llegue el momento de la temporada.' : lang === 'fr' ? 'Certaines caisses de votre commande sont hors saison. Nous les expédierons lorsque la saison arrivera.' : lang === 'pt' ? 'Algumas caixas no seu pedido estão fora de temporada. Enviá-las-emos quando chegar a temporada.' : lang === 'de' ? 'Einige Kisten in Ihrer Bestellung sind außerhalb der Saison. Wir werden sie versenden, wenn die Saison kommt.' : lang === 'nl' ? 'Sommige dozen in uw bestelling zijn buiten het seizoen. We zullen ze verzenden wanneer het seizoen arriveert.' : lang === 'da' ? 'Nogle kasser i din ordre er uden for sæsonen. Vi sender dem, når sæsonen ankommer.' : lang === 'sv' ? 'Några lådor i din beställning är utanför säsongen. Vi skickar dem när säsongen kommer.' : lang === 'fi' ? 'Jotkut laatikot tilauksessasi ovat kauden ulkopuolella. Lähetämme ne, kun kausi saapuu.' : lang === 'no' ? 'Noen bokser i bestillingen din er utenfor sesongen. Vi sender dem når sesongen kommer.' : 'Some boxes in your order are out of season. We will ship them when the season arrives.'}
                        </p>
                        {seasonWarnings.filter(w => !w.inSeason).map(w => (
                          <p key={w.variety} className={styles.seasonDetail}>
                            {getVarietyDisplayName(w.variety)}: {lang === 'es' ? 'Temporada' : lang === 'fr' ? 'Saison' : lang === 'pt' ? 'Temporada' : lang === 'de' ? 'Saison' : lang === 'nl' ? 'Seizoen' : lang === 'da' ? 'Sæson' : lang === 'sv' ? 'Säsong' : lang === 'fi' ? 'Kausi' : lang === 'no' ? 'Sesong' : 'Season'} {w.season}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multi-shipment warning */}
                  {hasMultipleVarieties && (
                    <div className={styles.multiShipmentWarning}>
                      <span className={styles.warningIcon}>📦</span>
                      <div className={styles.warningContent}>
                        <strong>{lang === 'es' ? 'Múltiples envíos requeridos' : lang === 'fr' ? 'Expéditions multiples requises' : lang === 'pt' ? 'Múltiplos envios necessários' : lang === 'de' ? 'Mehrere Sendungen erforderlich' : lang === 'nl' ? 'Meerdere verzendingen vereist' : lang === 'da' ? 'Flere forsendelser påkrævet' : lang === 'sv' ? 'Flera leveranser krävs' : lang === 'fi' ? 'Useita lähetyksiä vaaditaan' : lang === 'no' ? 'Flere forsendelser påkrevd' : 'Multiple shipments required'}</strong>
                        <p>
                          {lang === 'es' ? 'Tu pedido contiene ambas variedades (Hass y Lamb Hass) que tienen temporadas diferentes. Necesitaremos hacer 2 envíos separados. Te contactaremos para coordinar los envíos.' : lang === 'fr' ? 'Votre commande contient les deux variétés (Hass et Lamb Hass) qui ont des saisons différentes. Nous devrons faire 2 expéditions séparées. Nous vous contacterons pour coordonner les expéditions.' : lang === 'pt' ? 'O seu pedido contém ambas as variedades (Hass e Lamb Hass) que têm temporadas diferentes. Precisaremos fazer 2 envios separados. Contactá-lo-emos para coordenar os envios.' : lang === 'de' ? 'Ihre Bestellung enthält beide Sorten (Hass und Lamb Hass), die unterschiedliche Saisons haben. Wir müssen 2 separate Sendungen vornehmen. Wir werden Sie kontaktieren, um die Sendungen zu koordinieren.' : lang === 'nl' ? 'Uw bestelling bevat beide variëteiten (Hass en Lamb Hass) die verschillende seizoenen hebben. We moeten 2 aparte verzendingen maken. We zullen contact met u opnemen om de verzendingen te coördineren.' : lang === 'da' ? 'Din ordre indeholder begge sorter (Hass og Lamb Hass), der har forskellige sæsoner. Vi bliver nødt til at foretage 2 separate forsendelser. Vi kontakter dig for at koordinere forsendelserne.' : lang === 'sv' ? 'Din beställning innehåller båda sorterna (Hass och Lamb Hass) som har olika säsonger. Vi behöver göra 2 separata leveranser. Vi kommer att kontakta dig för att koordinera leveranserna.' : lang === 'fi' ? 'Tilauksesi sisältää molemmat lajikkeet (Hass ja Lamb Hass), joilla on eri kaudet. Meidän täytyy tehdä 2 erillistä lähetystä. Otamme yhteyttä koordinoimalla lähetykset.' : lang === 'no' ? 'Bestillingen din inneholder begge sortene (Hass og Lamb Hass) som har forskjellige sesonger. Vi må gjøre 2 separate forsendelser. Vi vil kontakte deg for å koordinere forsendelsene.' : 'Your order contains both varieties (Hass and Lamb Hass) which have different seasons. We will need to make 2 separate shipments. We will contact you to coordinate the shipments.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {checkoutError && (
                    <div className={styles.checkoutError}>
                      <span className={styles.errorIcon}>⚠️</span>
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleCompleteCheckout}
                    className={styles.checkoutButton}
                    disabled={items.length === 0 || isLoading || !selectedCountry}
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

