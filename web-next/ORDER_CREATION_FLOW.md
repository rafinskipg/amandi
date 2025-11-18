# Order Creation Flow

## Current Flow (Asynchronous)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Complete Checkout"                             │
│    → CheckoutPage.tsx calls /api/checkout                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Stripe Checkout Session Created                              │
│    → /api/checkout creates Stripe session                       │
│    → Returns: { sessionId, url }                                │
│    ❌ NO ORDER CREATED YET                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. User redirected to Stripe Checkout                           │
│    → User enters payment details                                 │
│    → Stripe processes payment                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Payment Successful - User Redirected                         │
│    → Stripe redirects to: /checkout/success?session_id=cs_...   │
│    → CheckoutSuccess.tsx component loads                         │
│    ❌ STILL NO ORDER CREATED YET                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
                    ↓               ↓
┌───────────────────────────┐  ┌──────────────────────────────┐
│ 5a. Frontend: Retry Logic │  │ 5b. Stripe Webhook (async)   │
│    → CheckoutSuccess.tsx   │  │    → Event: checkout.session │
│    → Polls /api/orders    │  │      .completed              │
│    → Max 10 attempts      │  │    → Calls /api/webhooks/    │
│    → 1 second delay       │  │      stripe                   │
└───────────────────────────┘  └──────────────────────────────┘
                                            ↓
                            ┌──────────────────────────────┐
                            │ 6. ORDER CREATED HERE!        │
                            │    → db.createOrder()         │
                            │    → Generates orderNumber    │
                            │    → Creates Order record      │
                            │    → Creates OrderItems       │
                            └──────────────────────────────┘
                                            ↓
                            ┌──────────────────────────────┐
                            │ 7. Frontend finds order       │
                            │    → Retry succeeds           │
                            │    → Displays orderNumber     │
                            └──────────────────────────────┘
```

## Key Points

### When Order is Created
- **Order ID and Order Number are created in the Stripe webhook handler** (`/api/webhooks/stripe/route.ts`)
- Specifically in the `checkout.session.completed` event handler (line 102)
- This happens **asynchronously** after payment completion

### Why There's a Delay
1. Stripe processes the payment
2. Stripe redirects user to success page (immediate)
3. Stripe sends webhook to our server (can take 1-5 seconds)
4. Our webhook handler creates the order
5. Frontend polls until order is found

### Current Implementation Details

**Checkout API** (`/api/checkout/route.ts`):
- Creates Stripe Checkout Session
- Stores cart items in `session.metadata.items`
- Does NOT create order

**Webhook Handler** (`/api/webhooks/stripe/route.ts`):
- Receives `checkout.session.completed` event
- Retrieves session with line items
- Parses items from metadata
- Creates order via `db.createOrder()`
- Generates unique `orderNumber` (format: `AVO123456789`)

**Success Page** (`CheckoutSuccess.tsx`):
- Receives `session_id` from URL
- Polls `/api/orders?sessionId=...` every 1 second
- Max 10 attempts (10 seconds total)
- Shows loading state while waiting
- Displays `orderNumber` when found

## Potential Issues

1. **Race Condition**: User might see success page before order is created
   - ✅ Mitigated by retry logic in `CheckoutSuccess.tsx`

2. **Webhook Delay**: Stripe webhook might take time to arrive
   - ✅ Retry mechanism handles this

3. **Webhook Failure**: If webhook fails, order won't be created
   - ⚠️ Currently returns success even if order creation fails (line 127)
   - Consider: Add admin notification or manual order creation tool

4. **Duplicate Orders**: Multiple webhook deliveries
   - ✅ Check for existing order by `stripeSessionId` (line 96)

## Alternative Approaches

### Option 1: Create Order Before Checkout (Pre-order)
**Pros:**
- Order exists immediately
- Can show order number before payment
- Better UX

**Cons:**
- Need to handle failed payments (cancel/delete order)
- More complex state management
- Orders in "pending" state for failed payments

### Option 2: Synchronous Order Creation (Current)
**Pros:**
- Only creates orders for successful payments
- Simpler state (no pending orders)
- Cleaner database

**Cons:**
- Delay between payment and order creation
- Requires retry logic on frontend
- User might see loading state

### Option 3: Hybrid Approach
- Create order in "pending" state when checkout session is created
- Update to "completed" when webhook arrives
- Cancel/delete if payment fails

## Recommendations

1. **Keep current approach** but improve error handling:
   - Add admin notification if webhook fails
   - Add manual order creation tool for edge cases
   - Log all webhook events for debugging

2. **Improve user experience**:
   - Show estimated wait time
   - Provide session ID as fallback
   - Send email confirmation when order is created (via webhook)

3. **Monitor webhook reliability**:
   - Track webhook delivery times
   - Alert if webhooks are delayed or failing
   - Consider Stripe webhook retry policy

