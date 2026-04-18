# Razorpay Payment Integration

## Overview

Razorpay is used for in-app purchases. The app sells two things:
- **Coins** (10 Coins for ₹50)
- **Premium Plan** (Premium status + 50 Coins for ₹500)

Users can also **exchange** Coins for Power Tokens (1 Coin → 2 Power Tokens) at no monetary cost — this is a separate in-app exchange, not a Razorpay transaction.

---

## Token Economy

| Token | Earned By | Spent On |
|-------|-----------|---------|
| **Power Tokens** | Cron refill every 2 hrs (max 10), Exchange (1 Coin → 2 Power) | Initiating or extending a call |
| **Coins** | Buy with Razorpay, Receiver earns 1 per completed call | Exchange for Power Tokens, included in Premium |

---

## Libraries

| Library | Where |
|---------|-------|
| `razorpay` (npm) | Backend — creates orders, verifies signatures |
| `window.Razorpay` (CDN script in HTML) | Frontend — opens payment modal |

The Razorpay JS SDK must be included in `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## Payment Flow — Step by Step

### Step 1: Frontend initiates order

```
User clicks "Buy Now" on Store page
        │
        ▼
handlePayment('coinTokens', 5000, 'Purchase 10 Coins', '...')
  │  (type, amount in paise, description, successMessage)
  │
  ▼
POST /api/user/payment/order  { type, amount }
  └── Authorization: Bearer <JWT>
```

### Step 2: Backend creates Razorpay order

```
createPaymentOrder controller:
        │
Razorpay({ key_id, key_secret }).orders.create({
  amount: 5000,    // in paise = ₹50
  currency: 'INR',
  receipt: 'rcpt_<userId12chars>_<timestamp6>'
})
        │
        ▼
200 { orderId, amount, currency, type }
```

Razorpay assigns a unique `order_id` (e.g. `order_XYZ123`). This ties the payment to a specific transaction on Razorpay's servers.

### Step 3: Frontend opens Razorpay checkout modal

```javascript
const options = {
  key:         VITE_RAZORPAY_KEY_ID,   // public key (rzp_test_... or rzp_live_...)
  amount:      orderData.amount,        // from backend response
  currency:    orderData.currency,
  name:        'Language Exchange',
  description: 'Purchase 10 Coins',
  order_id:    orderData.orderId,       // must match Razorpay order
  handler:     async (response) => { /* verify on backend */ },
  prefill:     { name: user.name, email: user.email },
  theme:       { color: '#1d1e22' },
};
new window.Razorpay(options).open();
```

User enters card/UPI/wallet details on Razorpay's hosted modal. Razorpay processes the payment.

### Step 4: Razorpay calls `handler` with payment response

On successful payment, Razorpay calls the `handler` function with:
```js
{
  razorpay_order_id:   'order_XYZ123',
  razorpay_payment_id: 'pay_ABC456',
  razorpay_signature:  '<HMAC-SHA256 hash>'
}
```

### Step 5: Frontend sends verification to backend

```
POST /api/user/payment/verify
  {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    type: 'coinTokens'   // or 'premium'
  }
  └── Authorization: Bearer <JWT>
```

### Step 6: Backend verifies signature (CRITICAL security step)

```javascript
// Razorpay signature = HMAC-SHA256 of "order_id|payment_id" using key_secret
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (generatedSignature !== razorpay_signature) {
  return 400 "Invalid payment signature"   // payment was tampered
}
```

This step **cannot be skipped**. Without it, anyone could fake a successful payment by sending a POST request directly to `/verify`.

### Step 7: Backend grants the purchase

```
type === 'coinTokens':
  user.coinTokens += 10
  user.save()
  → 200 "Successfully purchased 10 Coins"

type === 'premium':
  user.premium = true
  user.coinTokens += 50
  user.save()
  → 200 "Premium plan activated with 50 Coins"
```

### Step 8: Frontend refreshes profile

```javascript
toast.success(successMessage)
refetchProfile()   // RTK Query cache invalidation → re-fetch GET /api/user/profile
```

Redux state updates with new `coinTokens`, `premium`, etc. UI reflects immediately.

---

## Token Exchange (No Payment)

This is a separate flow — no Razorpay involved:

```
User clicks "Exchange Now" on Store page
        │
POST /api/user/exchange-tokens  { coinTokens: 1 }
        │
  user.coinTokens < 1?  → 400 "Insufficient Coin Tokens"
        │
  user.coinTokens -= 1
  user.powerTokens += 2
  user.save()
        │
  200 "Successfully exchanged 1 Coin Token for 2 Power Tokens"
        │
  refetchProfile()
```

**Max powerTokens** on the schema is defined as `max: 10`, but the controller doesn't enforce the max on exchange — it just adds 2. The schema `max` is a Mongoose validator, not a hard cap in the exchange endpoint.

---

## Power Token Cron Refill

Every 2 hours, a `node-cron` job runs:

```js
cron.schedule('0 */2 * * *', async () => {
  // tokenController.generatePowerToken
  // Finds all users with powerTokens < 10
  // Sets them back to 10
}, { timezone: 'Asia/Kolkata' })
```

This ensures users always eventually have tokens to make calls even if they run out.

---

## Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `RAZORPAY_KEY_ID` | Backend + Frontend | `rzp_test_...` or `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Backend only | Secret from Razorpay dashboard |
| `VITE_RAZORPAY_KEY_ID` | Frontend (Vite) | Same as KEY_ID (public) |

**Never expose `KEY_SECRET` to the frontend.** The key secret is only used backend-side for signature verification.

---

## Security Notes

1. **Signature verification** is the only guarantee a payment happened. Always verify before granting.
2. The `receipt` field in order creation is just a unique ID for your records — Razorpay doesn't use it for anything critical.
3. Use `rzp_test_*` keys in dev, `rzp_live_*` in production.
4. Razorpay test cards: `4111 1111 1111 1111`, any future expiry, any CVV.

---

## Key Files

| File | Role |
|------|------|
| `backend/controllers/userController.js` | `createPaymentOrder`, `verifyPayment`, `exchangePowerTokens` |
| `backend/controllers/tokenController.js` | Cron power token refill |
| `backend/routes/userRoutes.js` | `/payment/order`, `/payment/verify`, `/exchange-tokens` |
| `backend/server.js` | Cron job setup |
| `frontend/src/components/Store.jsx` | UI, `handlePayment`, `handleExchangePowerTokens` |
| `frontend/src/redux/services/userApi.js` | RTK mutations: `useCreatePaymentOrderMutation`, `useVerifyPaymentMutation`, `useExchangePowerTokensMutation` |
