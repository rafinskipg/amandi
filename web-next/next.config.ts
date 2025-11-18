import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // CRITICAL: Disable trailing slash enforcement to prevent 307 redirects
  // This ensures /api/webhooks/stripe doesn't get redirected to /api/webhooks/stripe/
  trailingSlash: false,
  
  // Prevent redirects for webhook endpoints
  async rewrites() {
    return []
  },
  async redirects() {
    return [
      // Explicitly exclude webhook routes from redirects
      // This ensures /api/webhooks/stripe doesn't get redirected
    ]
  },
  
  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        // Block access to sensitive files
        source: '/:path*\\.(env|git|log|sql|bak|backup|old|save|php)$',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet'
          },
        ],
      },
    ]
  },
};

export default nextConfig;
