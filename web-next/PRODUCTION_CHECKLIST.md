# Production Deployment Checklist

## 🔐 Environment Variables Required

Make sure these are set in your production environment:

### Required:
- `DATABASE_URL` - PostgreSQL connection string (already configured)
  - **IMPORTANT**: Add connection pool limits to prevent "too many connections" errors
  - Format: `postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=20`
  - Example: `postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20`
- `STRIPE_SECRET_KEY` - Stripe secret key (use `sk_live_...` for production)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (use `pk_live_...` for production)
- `NEXT_PUBLIC_BASE_URL` - Your production domain (e.g., `https://yourdomain.com`)
- `STRIPE_WEBHOOK_SECRET` - **CRITICAL**: Webhook signing secret from Stripe Dashboard
- `OPENAI_API_KEY` - OpenAI API key for chatbot functionality

### Optional but Recommended:
- `NODE_ENV=production` - Set to production mode

## ⚠️ Critical Issues to Fix Before Deploy

### 1. Webhook Secret Validation
**Status**: ⚠️ **NEEDS ATTENTION**

The webhook handler currently defaults to empty string if `STRIPE_WEBHOOK_SECRET` is not set, which will cause webhook verification to fail silently.

**Fix**: Add validation in webhook route:
```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not set!')
  return NextResponse.json(
    { error: 'Webhook secret not configured' },
    { status: 500 }
  )
}
```

### 2. Admin Dashboard Authentication
**Status**: ⚠️ **SECURITY CONCERN**

Currently using sessionStorage-based mock authentication. For production, consider:
- Implementing proper authentication (NextAuth.js, Auth0, etc.)
- Using server-side sessions
- Adding rate limiting
- Using environment variable for admin password instead of hardcoded values

**Current passwords**: `admin` or `amandi2024` (change these!)

### 3. Database Migrations
**Status**: ✅ Should be fine, but verify

Run migrations in production:
```bash
yarn db:migrate
# or
npx prisma migrate deploy
```

## 📋 Stripe Webhook Setup

### Step 1: Create Webhook Endpoint in Stripe Dashboard
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed` ✅ (handled)
   - `checkout.session.async_payment_succeeded` ✅ (handled)
   - `checkout.session.async_payment_failed` ✅ (handled)
   - `checkout.session.expired` ✅ (handled)
   - `payment_intent.succeeded` ✅ (handled)
   - `payment_intent.payment_failed` ✅ (handled)

### Step 2: Get Webhook Secret
1. After creating the webhook, click on it
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 3: Test Webhook
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Test with Stripe Dashboard's "Send test webhook" feature

## ✅ Pre-Deployment Checks

- [ ] All environment variables set in production
- [ ] Database migrations run (`yarn db:migrate` or `prisma migrate deploy`)
- [ ] Stripe webhook endpoint created and secret added
- [ ] `STRIPE_WEBHOOK_SECRET` environment variable set
- [ ] `NEXT_PUBLIC_BASE_URL` matches production domain
- [ ] Stripe keys switched to live mode (`sk_live_...`, `pk_live_...`)
- [ ] Admin dashboard password changed from defaults
- [ ] Database connection tested
- [ ] Build succeeds (`yarn build`)
- [ ] Test checkout flow end-to-end
- [ ] Test webhook receives events (check Stripe Dashboard logs)

## 🔍 Post-Deployment Verification

### Test Webhook:
1. Create a test order in production
2. Check Stripe Dashboard → Webhooks → Your endpoint → Recent events
3. Verify order appears in admin dashboard (`/dashboard`)
4. Check database for order creation

### Test Admin Dashboard:
1. Navigate to `/dashboard`
2. Login with password
3. Verify metrics load correctly
4. Verify orders list loads
5. Test order status updates
6. Test shipment creation
7. Test message sending

### Test Chatbot:
1. Open chatbot on homepage
2. Test order lookup functionality
3. Test product questions
4. Verify OpenAI API key is working

## 🐛 Known Issues / Limitations

1. **Admin Authentication**: Currently mock authentication using sessionStorage. Not secure for production.
2. **Webhook Secret**: Will fail silently if not set (needs validation)
3. **Error Handling**: Some webhook errors are logged but not tracked in database
4. **Email Notifications**: Not implemented - orders are created but no confirmation emails sent
5. **Order Tracking**: Customers can track orders but no email notifications

## 📝 Recommended Next Steps

1. **Implement proper authentication** for admin dashboard
2. **Add email notifications** for order confirmations
3. **Add error tracking** (Sentry, LogRocket, etc.)
4. **Add monitoring** (Uptime monitoring, error alerts)
5. **Implement rate limiting** on API routes
6. **Add request logging** for webhooks
7. **Set up backup strategy** for database
8. **Add analytics** for order tracking

## 🔗 Useful Links

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Webhooks: https://dashboard.stripe.com/webhooks
- Stripe Testing: https://stripe.com/docs/testing
- Prisma Migrate: https://www.prisma.io/docs/concepts/components/prisma-migrate

