# Stripe Integration Architecture (Non-Breaking Rollout)

## 1. Payment Integration Map (Current State)

### Backend payment-related modules
- `backend/server.js`
  - Mounts payment endpoints:
    - `/api/v2/payment` -> `backend/controller/payment.js`
    - `/api/v2/payment/phonepe` -> `backend/routes/phonePePayment.js`
    - `/api/v2/order` -> `backend/controller/order.js`
    - `/api/v2/subscription` -> `backend/controller/subscription.js`
    - `/api/v2/advertisement` -> `backend/routes/advertisement.js`
    - `/api/v2/withdraw` -> `backend/controller/withdraw.js`

- `backend/controller/payment.js`
  - Existing Stripe utility endpoints:
    - `POST /process` (creates Stripe PaymentIntent)
    - `GET /stripeapikey`

- `backend/controller/order.js`
  - `POST /create-order` creates order(s) per seller/shop
  - Persists `paymentInfo` into `Order`
  - COD wallet credit happens when status changes to `Delivered`
  - Online non-PayPal orders are credited to seller wallet at order creation

- `backend/model/order.js`
  - Payment fields:
    - `paymentInfo.id`
    - `paymentInfo.status`
    - `paymentInfo.type`

- `backend/controller/subscription.js`
  - Seller subscriptions are currently PayPal-first:
    - `POST /create-paypal-subscription`
    - `POST /activate-subscription`
  - Persists pending subscription before capture, then activates

- `backend/model/subscription.js`
  - Tracks `paymentMethod` (default `paypal`), `paypalSubscriptionId`, `paymentHistory`

- `backend/routes/advertisement.js` + `backend/controller/advertisement.js`
  - `POST /process-payment` marks ad payment completed (`paymentStatus`, `paymentId`, `paymentMethod`)
  - Used by seller and store-manager ad flows

- `backend/routes/phonePePayment.js` + `backend/controller/phonePePayment.js`
  - PhonePe order payments + callbacks
  - PhonePe payout API wrappers

- `backend/controller/withdraw.js`
  - Admin payout approvals:
    - manual mark success
    - PhonePe payout
    - PayPal payout

### Frontend payment-related modules
- `frontend/src/App.js`
  - Loads Stripe key from `/payment/stripeapikey`
  - Wraps `/payment` route with Stripe `Elements` (currently page logic is PayPal)
  - Has PhonePe success/fail/test routes

- `frontend/src/components/Checkout/Checkout.jsx`
  - Builds `latestOrder` in localStorage and routes to `/payment`

- `frontend/src/components/Payment/Payment.jsx`
  - User checkout payment UI is currently PayPal only
  - Calls `/order/create-order` with `paymentInfo.type = Paypal`

- `frontend/src/pages/PhonePeSuccessPage.jsx`
  - Verifies PhonePe status and then calls `/order/create-order`

- `frontend/src/components/Shop/SubscriptionPlans.jsx`
  - Calls `/subscription/create-paypal-subscription`

- `frontend/src/pages/SubscriptionSuccessPage.jsx`
  - Calls `/subscription/activate-subscription`

- `frontend/src/components/Shop/AdvertisementPayment.jsx`
  - Seller ad payment with PayPal buttons -> `/advertisement/process-payment`

- `frontend/src/components/StoreManager/SMHomepageAdPayment.jsx`
  - Store-manager ad payment entry -> `/advertisement/process-payment`

- `frontend/src/components/Admin/AllWithdraw.jsx`
  - Admin payout actions via `/withdraw/*` (PayPal/PhonePe)

## 2. Target Stripe Scope Across Panels

### In scope
- User checkout (buyer)
- Seller subscription payments
- Seller advertisement payments
- Store manager advertisement payments
- Shared payment records, webhook verification, idempotency

### Out of scope for phase 1 (keep existing behavior)
- Replacing seller withdrawal payout rails (PayPal/PhonePe payouts remain as-is)
- Removing PayPal/PhonePe/COD

## 3. Non-Breaking Strategy

1. Keep all existing PayPal/PhonePe/COD flows operational.
2. Add Stripe as an additional provider via feature flags.
3. Do not remove or rename current API routes used by frontend.
4. Add new Stripe endpoints and call them only when `paymentMethod === "stripe"`.
5. Use webhooks as payment source of truth before final state transitions.

## 4. Backend Design

## 4.1 New config flags
Add in backend env:
- `STRIPE_SECRET_KEY`
- `STRIPE_API_KEY` (publishable key)
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CURRENCY` (already exists)
- `ENABLE_STRIPE_CHECKOUT=true`
- `ENABLE_STRIPE_SUBSCRIPTION=true`
- `ENABLE_STRIPE_AD_PAYMENTS=true`

## 4.2 New payment transaction model
Create `backend/model/paymentTransaction.js`:
- `contextType`: `order | subscription | advertisement`
- `contextId`: ObjectId/String
- `provider`: `stripe | paypal | phonepe | cod`
- `providerIntentId`: PaymentIntent/CheckoutSession ID
- `providerChargeId`
- `status`: `created | requires_action | pending | succeeded | failed | refunded | canceled`
- `amount`, `currency`
- `metadata` (shopId, userId, cart hash, etc.)
- `idempotencyKey`
- `webhookEvents[]`
- timestamps

Purpose:
- decouple provider status from business entities
- allow retries and reconciliation

## 4.3 Payment service layer
Create shared service `backend/services/paymentGateway/`:
- `stripeGateway.js`
  - createPaymentIntent
  - retrievePaymentIntent
  - createCheckoutSession (optional)
  - verifyWebhookSignature
- `paymentOrchestrator.js`
  - createTransaction(context)
  - markSucceeded/markFailed
  - enforce idempotency

## 4.4 New/extended API endpoints
Extend `backend/controller/payment.js`:
- `POST /stripe/create-payment-intent`
  - input: `amount`, `currency`, `contextType`, `contextId`, `metadata`
  - output: `clientSecret`, `transactionId`
- `POST /stripe/confirm-intent`
  - server-side verify PaymentIntent status and mark transaction
- `POST /stripe/webhook` (raw body route)
  - handles:
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
    - `charge.refunded`

Important:
- webhook route must use raw body middleware only for this endpoint
- all business updates should be idempotent

## 4.5 Order flow integration
In `backend/controller/order.js`:
- keep current `POST /create-order` contract
- support `paymentInfo.type = "Stripe"`
- for Stripe orders:
  - require `paymentInfo.id` = Stripe PaymentIntent ID
  - verify transaction `succeeded` before final order creation OR create as `pending_payment` and finalize on webhook

Recommended safer approach:
- create order in `pending_payment` (new optional order status)
- finalize and trigger seller wallet movement only when webhook confirms success

Backward compatibility:
- existing PayPal and COD logic unchanged
- existing wallet credit rules preserved

## 4.6 Subscription flow integration
In `backend/controller/subscription.js`:
- add `POST /create-stripe-subscription-payment`
  - create pending subscription + Stripe PaymentIntent or Checkout Session
- add `POST /activate-stripe-subscription`
  - verify intent/session paid; then activate subscription
- add webhook-based activation as fallback source of truth

Model extension in `backend/model/subscription.js`:
- `stripePaymentIntentId`
- `stripeCustomerId` (optional)
- `stripeSessionId` (optional)

No removal of current PayPal endpoints.

## 4.7 Advertisement flow integration
In `backend/controller/advertisement.js`:
- keep `/process-payment` for PayPal/manual flows
- add Stripe-specific endpoints:
  - `POST /stripe/create-payment-intent`
  - `POST /stripe/confirm-payment`
- on success, set:
  - `paymentStatus = completed`
  - `paymentMethod = stripe`
  - `paymentId = payment_intent_id`

Works for both seller and store-manager because both already use ad payment API.

## 4.8 Payout/withdraw considerations
No breaking changes in phase 1:
- keep `withdraw` PayPal/PhonePe payout routes untouched

Optional phase 2:
- Stripe Connect payouts for sellers

## 5. Frontend Design

## 5.1 Shared payment method abstraction
Add `frontend/src/services/paymentProvider/stripe.js`:
- createIntent(context)
- confirmCardPayment(clientSecret)
- normalize result -> `{ status, providerId, method }`

Add `frontend/src/constants/paymentMethods.js`:
- `PAYPAL`, `PHONEPE`, `COD`, `STRIPE`

## 5.2 User checkout (`/payment`)
File: `frontend/src/components/Payment/Payment.jsx`
- Keep PayPal as existing default to avoid disruption
- Add method selector tabs:
  - PayPal (existing)
  - Stripe Card (new)
  - PhonePe (existing redirection, if enabled)
  - COD (if business allows in this view)
- Stripe tab logic:
  1. call `/payment/stripe/create-payment-intent`
  2. render Stripe Elements Card form
  3. call `stripe.confirmCardPayment`
  4. submit `/order/create-order` with
     - `paymentInfo.type = "Stripe"`
     - `paymentInfo.id = paymentIntent.id`
     - `paymentInfo.status = "succeeded"`

Fallback:
- if Stripe init fails, stay on current PayPal flow and show toast

## 5.3 Seller subscription page
File: `frontend/src/components/Shop/SubscriptionPlans.jsx`
- Add payment provider selector in checkout action modal
- Existing path:
  - PayPal -> `create-paypal-subscription`
- New Stripe path:
  - Stripe -> `create-stripe-subscription-payment`
  - after confirm -> `activate-stripe-subscription`
- Keep existing PayPal success page untouched; add Stripe success handler route if needed

## 5.4 Seller ad payment page
File: `frontend/src/components/Shop/AdvertisementPayment.jsx`
- Keep existing PayPal buttons
- Add Stripe card/button option
- On success call `/advertisement/stripe/confirm-payment`

## 5.5 Store manager ad payment page
File: `frontend/src/components/StoreManager/SMHomepageAdPayment.jsx`
- Keep current PayPal option
- Add Stripe option using same ad endpoints

## 5.6 Admin panel
- `frontend/src/components/Admin/AllWithdraw.jsx`
  - no phase 1 change required
- optionally add transaction view panel later for Stripe payments (read-only)

## 6. Data Compatibility and Migration

## 6.1 Keep existing schema fields
Do not break old docs:
- `Order.paymentInfo` remains supported
- `Subscription.paymentMethod = paypal` continues to work
- `Advertisement.paymentStatus/paymentMethod/paymentId` stays same

## 6.2 Additive-only changes
All new fields should be optional and nullable.

## 6.3 Existing records
No data migration required for first rollout.

## 7. Webhook and Idempotency Rules

1. All webhook handlers must validate Stripe signature.
2. Deduplicate by `event.id`.
3. Deduplicate business writes by `providerIntentId` + `contextType` + `contextId`.
4. Ignore out-of-order events if transaction already terminal (`succeeded`, `failed`, `refunded`).

## 8. Safety Checklist (Do Not Break Existing Functionality)

1. Keep all current routes and payload contracts valid.
2. Default UI payment option remains existing provider until Stripe is explicitly selected.
3. Feature-flag Stripe by panel.
4. Add regression tests for:
   - PayPal checkout still creates order
   - COD delivered status still credits seller wallet
   - PhonePe success path still creates order
   - Subscription PayPal flow unchanged
   - Advertisement PayPal flow unchanged
5. Add Stripe tests for success/failure/cancel/retry/webhook race.

## 9. Recommended Implementation Phases

### Phase 1: Infrastructure
- Add transaction model + Stripe service + webhook endpoint

### Phase 2: User checkout
- Add Stripe tab in `Payment.jsx`
- Keep PayPal default

### Phase 3: Subscription
- Add Stripe option in `SubscriptionPlans.jsx`

### Phase 4: Advertisement (seller + store manager)
- Add Stripe option in ad payment components

### Phase 5: Hardening
- Reconciliation job for stale `pending` transactions
- Admin payment audit screen

## 10. Security Notes

- Move all hardcoded provider credentials/client IDs into environment variables.
- Rotate any exposed credentials immediately.
- Never trust frontend payment success alone; always verify on backend/webhook.

## 11. Payment Method Decision Matrix (Final)

- User checkout:
  - Keep: PayPal, PhonePe, COD
  - Add: Stripe
- Seller subscription:
  - Keep: PayPal
  - Add: Stripe
- Seller/store-manager ads:
  - Keep: PayPal/manual current route
  - Add: Stripe
- Seller payouts:
  - Keep: PayPal + PhonePe (phase 1)
  - Stripe Connect payouts optional (phase 2)
