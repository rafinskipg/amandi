#!/bin/bash

# Test production webhook endpoint
# Usage: ./test-webhook-production.sh

PROD_URL="https://www.amandi.bio"
WEBHOOK_URL="${PROD_URL}/api/webhooks/stripe"

echo "Testing PRODUCTION webhook endpoint: ${WEBHOOK_URL}"
echo "⚠️  This will test against production!"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Test for redirects
echo "=== Testing for redirects ==="
HTTP_CODE=$(curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "%{http_code}" \
  -s -o /dev/null \
  -L \
  --max-redirs 0)

echo "HTTP Status Code: ${HTTP_CODE}"

if [ "${HTTP_CODE}" = "307" ] || [ "${HTTP_CODE}" = "308" ]; then
  echo ""
  echo "❌ ERROR: Got ${HTTP_CODE} redirect!"
  echo ""
  echo "Possible causes:"
  echo "1. Webhook URL in Stripe has trailing slash: ${WEBHOOK_URL}/"
  echo "2. Vercel is redirecting www to non-www or vice versa"
  echo "3. Vercel redirects are affecting /api/webhooks/stripe"
  echo ""
  echo "Solutions:"
  echo "1. Check Stripe Dashboard → Webhooks → Your endpoint URL"
  echo "2. Check Vercel Dashboard → Project Settings → Redirects"
  echo "3. Ensure webhook URL matches exactly (including www)"
elif [ "${HTTP_CODE}" = "400" ]; then
  echo "✅ Good: Got 400 (expected - missing signature)"
  echo "The endpoint is working correctly!"
elif [ "${HTTP_CODE}" = "200" ]; then
  echo "⚠️  Got 200 (unexpected - should be 400 without signature)"
else
  echo "⚠️  Got ${HTTP_CODE}"
fi

echo ""
echo "=== Full request details ==="
curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v 2>&1 | grep -E "(HTTP|Location|POST|GET|Host|>)" | head -15

