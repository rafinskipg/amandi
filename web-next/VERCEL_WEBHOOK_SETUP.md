# Vercel Webhook Setup Guide

## Problem: 307 Temporary Redirect

Stripe webhooks returning 307 errors in Vercel is a common issue. This guide provides solutions.

## Solutions Implemented

### 1. Route Configuration
- ✅ Added `export const runtime = 'nodejs'`
- ✅ Added `export const dynamic = 'force-dynamic'`
- ✅ Added `export const maxDuration = 30`
- ✅ Added OPTIONS handler for CORS preflight

### 2. Vercel Dashboard Configuration

**CRITICAL: Check these settings in Vercel Dashboard:**

1. **Domain Configuration:**
   - Go to: Project Settings → Domains
   - Ensure your domain is correctly configured
   - Check if there's a redirect from `www` to non-`www` or vice versa
   - **The webhook URL in Stripe MUST match exactly** (including www/non-www)

2. **Webhook URL in Stripe Dashboard:**
   - Must be: `https://www.amandi.bio/api/webhooks/stripe` (or your exact domain)
   - **NO trailing slash** (`/api/webhooks/stripe/` ❌)
   - **Must match your Vercel domain exactly** (including www)

3. **Vercel Redirects:**
   - Go to: Project Settings → Redirects
   - Ensure there are NO redirects affecting `/api/webhooks/stripe`
   - If you have redirects, add an exception:
     ```json
     {
       "source": "/api/webhooks/stripe",
       "destination": "/api/webhooks/stripe",
       "permanent": false
     }
     ```

### 3. Testing the Webhook Endpoint

Test your endpoint directly:

```bash
# Test with curl
curl -X POST https://www.amandi.bio/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Should return 400 (missing signature) NOT 307
```

### 4. Common Causes of 307

1. **Trailing Slash Mismatch:**
   - Stripe URL: `https://domain.com/api/webhooks/stripe/` (with slash)
   - Actual route: `/api/webhooks/stripe` (no slash)
   - **Solution:** Remove trailing slash from Stripe webhook URL

2. **Domain Redirect:**
   - Stripe URL: `https://amandi.bio/api/webhooks/stripe`
   - Vercel redirects to: `https://www.amandi.bio/api/webhooks/stripe`
   - **Solution:** Use the final redirected URL in Stripe

3. **HTTPS Redirect:**
   - Stripe URL: `http://www.amandi.bio/api/webhooks/stripe`
   - Vercel redirects to HTTPS
   - **Solution:** Always use HTTPS in Stripe webhook URL

### 5. Debugging Steps

1. **Check Vercel Logs:**
   ```bash
   vercel logs --follow
   ```
   Look for:
   - `[Webhook] Received POST request`
   - `[Webhook] URL: ...`
   - `[Webhook] Method: ...`

2. **Check Stripe Dashboard:**
   - Go to: Webhooks → Your endpoint → Recent events
   - Check the response status code
   - View the response body

3. **Test Locally with Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   This bypasses Vercel and tests your code directly.

### 6. Vercel-Specific Fixes

If 307 persists after above fixes:

1. **Create `vercel.json` in project root:**
   ```json
   {
     "rewrites": [],
     "redirects": [
       {
         "source": "/api/webhooks/stripe",
         "has": [
           {
             "type": "header",
             "key": "stripe-signature"
           }
         ],
         "destination": "/api/webhooks/stripe",
         "permanent": false
       }
     ]
   }
   ```

2. **Or use Next.js middleware to exclude webhook:**
   Create `middleware.ts`:
   ```typescript
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   export function middleware(request: NextRequest) {
     // Skip middleware for webhook routes
     if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
       return NextResponse.next()
     }
     // ... rest of your middleware
   }
   ```

### 7. Final Checklist

- [ ] Webhook URL in Stripe has NO trailing slash
- [ ] Webhook URL uses HTTPS
- [ ] Webhook URL matches Vercel domain exactly (www/non-www)
- [ ] No redirects in Vercel affecting `/api/webhooks/stripe`
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Vercel environment variables
- [ ] Route exports `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`
- [ ] Test endpoint returns 400 (not 307) when called without signature

### 8. If Still Failing

1. **Check Vercel Function Logs:**
   - Go to: Vercel Dashboard → Your Project → Functions
   - Check `/api/webhooks/stripe` function logs
   - Look for any errors or redirects

2. **Contact Vercel Support:**
   - Provide them with:
     - Your webhook URL
     - Stripe event ID that failed
     - Vercel function logs
     - Response headers from failed request

3. **Alternative: Use Vercel Edge Functions:**
   - Move webhook to Edge Runtime (but this requires different Stripe SDK usage)
   - Not recommended unless necessary

## Current Implementation

The webhook route now includes:
- ✅ Proper runtime configuration
- ✅ OPTIONS handler for CORS
- ✅ Explicit status 200 responses
- ✅ Enhanced logging
- ✅ Method verification
- ✅ Error handling that returns 200 (to prevent Stripe retries)

## Testing

After deployment, test with:
```bash
# Should return 400 (missing signature) - NOT 307
curl -X POST https://www.amandi.bio/api/webhooks/stripe -H "Content-Type: application/json" -d '{}'
```

If you get 307, the issue is with Vercel configuration, not the code.

