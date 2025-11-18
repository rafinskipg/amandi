import { NextRequest, NextResponse } from 'next/server'

// Common scraping bot user agents
const BLOCKED_USER_AGENTS = [
  'ahrefsbot',
  'semrushbot',
  'dotbot',
  'mj12bot',
  'blexbot',
  'petalbot',
  'dataforseobot',
  'megaindex',
  'ccbot',
  'chatgpt-user',
  'gptbot',
  'anthropic-ai',
  'claude-web',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'python-requests',
  'scrapy',
  'curl',
  'wget',
  'httpie',
  'go-http-client',
  'java/',
  'node-fetch',
  'axios',
  'postman',
]

// Common malicious/scraping paths to block
const BLOCKED_PATHS = [
  '/.env',
  '/.git',
  '/.git/config',
  '/phpinfo.php',
  '/info.php',
  '/phpinfo.php.save',
  '/info.php.save',
  '/site/phpinfo.php',
  '/site/info.php',
  '/www/phpinfo.php',
  '/www/info.php',
  '/tmp/',
  '/dev/',
  '/scripts/',
  '/cgi-bin/',
  '/includes/',
  '/admin/',
  '/wp-admin/',
  '/wp-login.php',
  '/administrator/',
  '/.well-known/',
  '/.htaccess',
  '/.htpasswd',
  '/config.php',
  '/database.php',
  '/backup.sql',
  '/dump.sql',
]

// Rate limiting store (in-memory, resets on server restart)
// For production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // Max requests per minute per IP

function isBlockedUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return BLOCKED_USER_AGENTS.some(blocked => ua.includes(blocked))
}

function isBlockedPath(pathname: string): boolean {
  // Don't block API routes - they're handled separately
  if (pathname.startsWith('/api/')) {
    return false
  }
  return BLOCKED_PATHS.some(blocked => pathname.toLowerCase().includes(blocked.toLowerCase()))
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent')
  // Get IP from headers (Vercel uses x-forwarded-for, others may use x-real-ip)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'

  // Block webhook endpoint from being accessed via GET (except from Stripe)
  // This was already handled, but keep it for safety
  if (pathname === '/api/webhooks/stripe' && request.method === 'GET') {
    const stripeUserAgent = request.headers.get('user-agent') || ''
    // Allow Stripe's user agent or if it's a health check
    if (!stripeUserAgent.includes('Stripe') && !pathname.includes('health')) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }
  }

  // Block common malicious/scraping paths
  if (isBlockedPath(pathname)) {
    console.log(`[Security] Blocked path access: ${pathname} from IP: ${ip}`)
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }

  // Block known scraping bots
  if (isBlockedUserAgent(userAgent)) {
    console.log(`[Security] Blocked user agent: ${userAgent} from IP: ${ip}`)
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  // Rate limiting for API routes (except webhooks which have their own protection)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks/')) {
    if (!checkRateLimit(ip)) {
      console.log(`[Security] Rate limit exceeded for IP: ${ip} on path: ${pathname}`)
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Only add CSP for non-API routes (to avoid breaking webhooks)
  if (!pathname.startsWith('/api/')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.stripe.com https://*.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;"
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
}

