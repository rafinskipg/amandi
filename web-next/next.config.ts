import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
