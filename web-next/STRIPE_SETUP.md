# Stripe Integration Setup Guide

This project uses Stripe Checkout for payment processing. Follow these steps to set up Stripe integration.

## Prerequisites

1. Create a Stripe account at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys

## Environment Variables

Create a `.env.local` file in the root of the `web-next` directory with the following variables:

```env
# Stripe Configuration
# Get your keys from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Base URL for your application (used in checkout redirects)
# For local development, use: http://localhost:3000
# For production, use your actual domain: https://yourdomain.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Steps

1. **Install dependencies** (already done):
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Get your Stripe API keys**:
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your "Secret key" (starts with `sk_test_` for test mode)
   - Copy your "Publishable key" (starts with `pk_test_` for test mode)

3. **Set up environment variables**:
   - Create `.env.local` file in the `web-next` directory
   - Add your Stripe keys and base URL

4. **Test the integration**:
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC (e.g., 123)
   - Any ZIP code (e.g., 12345)

## How It Works

1. **Checkout Flow**:
   - User adds products to cart
   - User clicks "Complete order" on checkout page
   - Frontend calls `/api/checkout` with cart items
   - API creates a Stripe Checkout Session
   - User is redirected to Stripe Checkout page
   - After payment, user is redirected to success page
   - Cart is automatically cleared on success

2. **API Route** (`/app/api/checkout/route.ts`):
   - Creates Stripe Checkout Session
   - Converts cart items to Stripe line items
   - Handles product metadata (varieties, etc.)
   - Returns checkout session URL

3. **Success/Cancel Pages**:
   - Success page: `/checkout/success` or `/[lang]/checkout/success`
   - Cancel page: `/checkout/cancel` or `/[lang]/checkout/cancel`

## Production Setup

1. **Switch to live mode**:
   - Get live API keys from Stripe Dashboard
   - Update `.env.local` with live keys (starts with `sk_live_` and `pk_live_`)
   - Update `NEXT_PUBLIC_BASE_URL` to your production domain

2. **Configure webhooks** (optional but recommended):
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Use webhook to update order status, send confirmation emails, etc.

## Testing

- Use Stripe test mode for development
- Test cards: https://stripe.com/docs/testing
- Monitor payments in Stripe Dashboard: https://dashboard.stripe.com/test/payments

## Troubleshooting

- **"No checkout URL received"**: Check that `STRIPE_SECRET_KEY` is set correctly
- **"Failed to create checkout session"**: Verify Stripe API key is valid and has correct permissions
- **Redirect issues**: Ensure `NEXT_PUBLIC_BASE_URL` matches your actual domain

