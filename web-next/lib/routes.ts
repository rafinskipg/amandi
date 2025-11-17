/**
 * Helper functions for route generation with language prefix
 */

const languageCodes = ['es', 'en', 'pt', 'fr', 'de', 'nl', 'da', 'sv', 'fi', 'no']

/**
 * Extract language code from pathname
 */
export function getLangFromPath(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})/)
  return match && languageCodes.includes(match[1]) ? match[1] : 'es'
}

/**
 * Build a route with language prefix
 */
export function buildRoute(pathname: string, route: string): string {
  const lang = getLangFromPath(pathname)
  // Remove leading slash from route if present
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route
  return `/${lang}/${cleanRoute}`
}

/**
 * Build shop route
 */
export function buildShopRoute(pathname: string): string {
  return buildRoute(pathname, '/shop')
}

/**
 * Build checkout route
 */
export function buildCheckoutRoute(pathname: string): string {
  return buildRoute(pathname, '/checkout')
}

/**
 * Build product route
 */
export function buildProductRoute(pathname: string, productId: string): string {
  return buildRoute(pathname, `/shop/${productId}`)
}

