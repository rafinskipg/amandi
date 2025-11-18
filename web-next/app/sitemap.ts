import { MetadataRoute } from 'next'
import { getAllSeoPaths } from '@/lib/countries'
import { getAllSpecialSeoPaths } from '@/lib/seoPages'
import { products } from '@/lib/products'
import { countries } from '@/lib/countries'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.amandi.bio'

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Home pages
  sitemapEntries.push({
    url: `${BASE_URL}/es`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  })
  sitemapEntries.push({
    url: `${BASE_URL}/en`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  })

  // Shop pages
  sitemapEntries.push({
    url: `${BASE_URL}/es/shop`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })
  sitemapEntries.push({
    url: `${BASE_URL}/en/shop`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  // Product pages
  const languages = ['es', 'en']
  products.forEach(product => {
    languages.forEach(lang => {
      sitemapEntries.push({
        url: `${BASE_URL}/${lang}/shop/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    })
  })

  // Track order pages
  sitemapEntries.push({
    url: `${BASE_URL}/es/track`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  })
  sitemapEntries.push({
    url: `${BASE_URL}/en/track`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  })

  // Privacy and Shipping pages
  sitemapEntries.push({
    url: `${BASE_URL}/es/privacy`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  })
  sitemapEntries.push({
    url: `${BASE_URL}/en/privacy`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  })
  sitemapEntries.push({
    url: `${BASE_URL}/es/shipping`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  })
  sitemapEntries.push({
    url: `${BASE_URL}/en/shipping`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  })

  // SEO country pages
  const seoPaths = getAllSeoPaths()
  seoPaths.forEach(({ path }) => {
    sitemapEntries.push({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  // Special SEO pages (maternity, etc.)
  const specialPaths = getAllSpecialSeoPaths()
  specialPaths.forEach(({ path }) => {
    sitemapEntries.push({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  return sitemapEntries
}

