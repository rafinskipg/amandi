#!/bin/bash

# Test webhook endpoint with Stripe event payload
# Usage: ./test-webhook.sh [URL]
# Example: ./test-webhook.sh http://localhost:3000
# Example: ./test-webhook.sh https://www.amandi.bio

URL="${1:-http://localhost:3000}"
WEBHOOK_URL="${URL}/api/webhooks/stripe"

echo "Testing webhook endpoint: ${WEBHOOK_URL}"
echo ""

# Test 1: Without signature (should return 400)
echo "=== Test 1: POST without stripe-signature (should return 400) ==="
curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s -o /dev/null
{
  "id": "evt_1SUlBDJUuEwzqphXBg42FNTa",
  "object": "event",
  "api_version": "2025-10-29.clover",
  "created": 1763457991,
  "data": {
    "object": {
      "id": "cs_test_a1I6s3T6fqLjiLDUO2C2RbdTLAZ8Sr3mrbfU9OYS8vfHZtqaPiweosTAaV",
      "object": "checkout.session",
      "client_reference_id": "42a8b78e-8faa-4ab2-bd0d-aef497c1b744",
      "amount_total": 4320,
      "currency": "eur",
      "customer_details": {
        "email": "rafinskipg@gmail.com",
        "name": "Rafael pedrola gimeno",
        "address": {
          "city": "La pesa (Llanes)",
          "country": "ES",
          "line1": "LLN-17. 15 (carretera a garaña, casa verde)",
          "postal_code": "33591",
          "state": "O"
        }
      },
      "collected_information": {
        "shipping_details": {
          "address": {
            "city": "La pesa (Llanes)",
            "country": "ES",
            "line1": "LLN-17. 15 (carretera a garaña, casa verde)",
            "postal_code": "33591",
            "state": "O"
          },
          "name": "Rafael pedrola gimeno"
        }
      },
      "metadata": {
        "items": "[{\"productId\":\"subscription\",\"quantity\":1,\"variety\":null}]"
      },
      "payment_status": "paid",
      "status": "complete"
    }
  },
  "type": "checkout.session.completed"
}
EOF

echo ""
echo ""

# Test 2: Check for redirects (should NOT return 307)
echo "=== Test 2: Check for redirects (should NOT return 307) ==="
HTTP_CODE=$(curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "%{http_code}" \
  -s -o /dev/null \
  -L)

echo "HTTP Status Code: ${HTTP_CODE}"

if [ "${HTTP_CODE}" = "307" ] || [ "${HTTP_CODE}" = "308" ]; then
  echo "❌ ERROR: Got ${HTTP_CODE} redirect! This is the problem."
  echo "   Check Vercel redirects and webhook URL configuration."
elif [ "${HTTP_CODE}" = "400" ]; then
  echo "✅ Good: Got 400 (expected - missing signature)"
elif [ "${HTTP_CODE}" = "200" ]; then
  echo "⚠️  Got 200 (unexpected - should be 400 without signature)"
else
  echo "⚠️  Got ${HTTP_CODE} (unexpected)"
fi

echo ""
echo ""

# Test 3: Full verbose request
echo "=== Test 3: Full request with verbose output ==="
curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1234567890,v1=test_signature" \
  -d @- << 'EOF' \
  -v 2>&1 | grep -E "(HTTP|Location|POST|GET|307|308|400|200|301|302)" | head -10
{
  "id": "evt_1SUlBDJUuEwzqphXBg42FNTa",
  "object": "event",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1I6s3T6fqLjiLDUO2C2RbdTLAZ8Sr3mrbfU9OYS8vfHZtqaPiweosTAaV",
      "object": "checkout.session",
      "client_reference_id": "42a8b78e-8faa-4ab2-bd0d-aef497c1b744",
      "amount_total": 4320,
      "currency": "eur",
      "customer_details": {
        "email": "rafinskipg@gmail.com"
      },
      "metadata": {
        "items": "[{\"productId\":\"subscription\",\"quantity\":1,\"variety\":null}]"
      },
      "payment_status": "paid",
      "status": "complete"
    }
  }
}
EOF

echo ""
echo ""
echo "=== Summary ==="
echo "If you see 307 or 308, the problem is with Vercel redirects."
echo "If you see 400, the endpoint is working correctly (just needs valid signature)."
echo "If you see 200, check your webhook secret configuration."

