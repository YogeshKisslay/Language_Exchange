# Language Exchange

A real-time language learning platform where users practice speaking with native speakers through live audio calls.

---

## What It Does

- **Live audio calls** — match with a speaker of the language you're learning
- **Token economy** — spend Power Tokens to call, earn Coins by teaching
- **Premium features** — selective calling, user directory, email messaging
- **Razorpay payments** — buy Coins or upgrade to Premium
- **Auth0 / Google login** — sign in with Google or email + password

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Redux Toolkit + RTK Query | State management + API calls |
| Socket.IO Client | Real-time signaling |
| WebRTC (browser API) | Peer-to-peer audio |
| Bootstrap 5 + Bootstrap Icons | UI components |
| Vite | Build tool |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | HTTP server |
| Socket.IO | Real-time signaling server |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| Passport + passport-auth0 | Google OAuth |
| Razorpay | Payments |
| node-cron | Token refresh scheduler |
| Nodemailer | Email (verification, missed call alerts) |

---

## Project Structure

```
Language_Exchange/
├── language-exchange-backend/
│   ├── config/
│   │   ├── db.js              ← MongoDB connection
│   │   └── passportConfig.js  ← Auth0 strategy
│   ├── controllers/
│   │   ├── authController.js  ← register, login, Auth0, reset password
│   │   ├── callController.js  ← initiate, accept, reject, end, extend calls
│   │   ├── userController.js  ← profile, payments, token exchange
│   │   ├── missedCallController.js
│   │   └── tokenController.js ← cron power token refill
│   ├── middleware/
│   │   └── authMiddleware.js  ← JWT verification
│   ├── models/
│   │   ├── userModel.js
│   │   ├── callModel.js
│   │   └── missedCallModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── callRoutes.js
│   │   └── missedCallRoutes.js
│   ├── services/
│   │   └── emailService.js
│   ├── socket.js              ← All Socket.IO event handlers
│   └── server.js              ← Express app entry point
│
└── language-exchange-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Home.jsx        ← Landing page + call UI
    │   │   ├── Premium.jsx     ← Premium dashboard + call UI
    │   │   ├── Profile.jsx     ← User profile
    │   │   ├── UpdateProfile.jsx
    │   │   ├── Store.jsx       ← Razorpay purchases
    │   │   ├── LoginModal.jsx
    │   │   ├── RegisterModal.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Navbar.jsx
    │   │   └── EmailModal.jsx
    │   ├── hooks/
    │   │   └── useCallLogic.js ← All call logic (Socket.IO + WebRTC)
    │   ├── redux/
    │   │   ├── services/
    │   │   │   ├── authApi.js
    │   │   │   ├── userApi.js
    │   │   │   ├── callApi.js
    │   │   │   └── missedCallApi.js
    │   │   └── slices/
    │   │       └── authSlice.js
    │   ├── styles/
    │   │   └── Home.css
    │   ├── App.jsx
    │   └── index.css
    └── docs/
        ├── authentication.md  ← JWT auth + email/password flow
        ├── auth0.md           ← Google OAuth via Auth0
        ├── razorpay.md        ← Payment integration
        └── call-logic.md      ← Full WebRTC + Socket.IO call flow
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Auth0 account
- Razorpay account

### Backend Setup

```bash
cd language-exchange-backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Auth0
AUTH0_DOMAIN=dev-xxx.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (Nodemailer)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Skip email verification in dev
BYPASS_EMAIL=true
```

```bash
npm start
```

### Frontend Setup

```bash
cd language-exchange-frontend
npm install
```

Create `.env`:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_BYPASS_EMAIL=true
```

```bash
npm run dev
```

---

## How Calls Work (Quick Summary)

1. Caller enters a language and clicks **Initiate Call** → backend finds online speakers of that language → sends `call-request` socket event to each
2. Receiver sees incoming call UI → clicks **Accept** → backend marks call active, deducts 1 Power Token from caller
3. Caller receives `call-accepted` socket event → starts WebRTC: acquires mic, creates offer, sends via socket
4. Receiver receives offer → creates answer → sends via socket
5. Both peers exchange ICE candidates (via socket relay) → WebRTC finds a path (STUN for direct, TURN for NAT/mobile)
6. Audio flows peer-to-peer
7. Call auto-ends after 5 minutes (or 10 if extended) → receiver earns 1 Coin if call was completed

For the full technical deep-dive: see [docs/call-logic.md](docs/call-logic.md)

---

## Token Economy

| Action | Power Tokens | Coins |
|--------|-------------|-------|
| App start (new user) | +10 | 0 |
| Cron refill (every 2h) | refill to 10 | — |
| Initiate/Accept a call | -1 | — |
| Extend a call (approved) | -1 | — |
| Complete a 5-min call (receiver) | — | +1 |
| Extend approved (receiver) | — | +1 |
| Buy Coins (₹50) | — | +10 |
| Exchange Coins | +2 | -1 |
| Buy Premium (₹500) | — | +50, Premium unlocked |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [authentication.md](docs/authentication.md) | JWT auth, login, register, password reset |
| [auth0.md](docs/auth0.md) | Google OAuth via Auth0, account linking |
| [razorpay.md](docs/razorpay.md) | Payment flow, signature verification, token economy |
| [call-logic.md](docs/call-logic.md) | Complete WebRTC + Socket.IO call flow with every event |

---

## Deployment

Both services are deployed on **Render** (free tier):
- Backend: `https://language-exchange-backend.onrender.com`
- Frontend: `https://language-exchange-frontend.onrender.com`

CORS is configured to allow only these two origins.

---

## License

MIT
