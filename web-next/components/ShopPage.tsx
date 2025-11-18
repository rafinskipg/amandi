'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Translations } from '@/lib/translations'
import { products, getProductsByCategory, type Product } from '@/lib/products'
import { es } from '@/lib/translations'
import { buildProductRoute } from '@/lib/routes'
import LanguageSelector from './LanguageSelector'
import ProductImage from './ProductImage'
import Footer from './Footer'
import styles from './ShopPage.module.css'

interface Props {
  translations: Translations
}

const categories = [
  { id: 'avocados', name: { es: 'Aguacates', en: 'Avocados' } },
  { id: 'artisan', name: { es: 'Artesanía', en: 'Artisan' } },
  { id: 'produce', name: { es: 'Productos frescos', en: 'Fresh produce' } },
  { id: 'honey-nuts', name: { es: 'Miel y frutos secos', en: 'Honey & nuts' } },
] as const

export default function ShopPage({ translations }: Props) {
  const pathname = usePathname()
  
  // Detect language
  const langMatch = pathname.match(/^\/(en|es)/)
  const lang = (langMatch ? langMatch[1] : 'es') as 'es' | 'en'
  const isSpanish = lang === 'es' || translations === es

  const t = translations.shop || {
    title: 'Our shop',
    subtitle: 'Discover all our products',
    description: 'In addition to our avocados, we offer other products from our farm and local artisans.',
  }

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getProductTitle = (product: Product) => {
    return product.title[lang] || product.title.en
  }

  const getProductDescription = (product: Product) => {
    return product.description[lang] || product.description.en
  }

  return (
    <>
      <LanguageSelector />
      <section className={styles.section}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
            <p className={styles.description}>{t.description}</p>

            {categories.map((category) => {
              const categoryProducts = getProductsByCategory(category.id as any)
              if (categoryProducts.length === 0) return null

              return (
                <div key={category.id} className={styles.categorySection}>
                  <h2 className={styles.categoryTitle}>
                    {category.name[lang]}
                  </h2>
                  <div className={styles.grid}>
                    {categoryProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        className={styles.card}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Link href={buildProductRoute(pathname, product.id)} className={styles.cardLink}>
                          <div className={styles.imageContainer}>
                            {product.images && product.images.length > 0 ? (
                              <ProductImage
                                src={product.images[0]}
                                alt={getProductTitle(product)}
                                fallbackIcon={product.icon}
                                className={styles.image}
                                fill
                              />
                            ) : product.icon ? (
                              <div className={styles.icon}>
                                {product.icon}
                              </div>
                            ) : null}
                          </div>
                          <div className={styles.cardContent}>
                            <h3 className={styles.productTitle}>{getProductTitle(product)}</h3>
                            <p className={styles.productDescription}>
                              {getProductDescription(product).substring(0, 120)}...
                            </p>
                            <div className={styles.priceRow}>
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
                                  {isSpanish ? 'Desde' : 'From'} {formatPrice(0, product.currency)}
                                </span>
                              )}
                            </div>
                            {product.inStock && (
                              <span className={styles.inStock}>
                                ✓ {isSpanish ? 'En stock' : 'In stock'}
                              </span>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>
      <Footer translations={translations} />
    </>
  )
}

