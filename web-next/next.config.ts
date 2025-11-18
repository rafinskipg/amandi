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
};

export default nextConfig;
