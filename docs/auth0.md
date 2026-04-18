# Auth0 (Google OAuth) Integration

## Overview

Auth0 is used as an OAuth provider so users can sign in with their Google account. The backend uses `passport-auth0` to handle the OAuth dance. At the end of the flow, the user gets the same JWT that email/password login produces — no special Auth0 token is stored.

---

## Libraries

| Library | Purpose |
|---------|---------|
| `passport` | Authentication middleware for Express |
| `passport-auth0` | Auth0 strategy for Passport |
| `express-session` | Session storage (required for Auth0 state param) |
| `cookie-parser` | Required by express-session |

---

## Configuration (`config/passportConfig.js`)

```js
passport.use(new Auth0Strategy({
  domain:        process.env.AUTH0_DOMAIN,       // e.g. dev-xxx.us.auth0.com
  clientID:      process.env.AUTH0_CLIENT_ID,
  clientSecret:  process.env.AUTH0_CLIENT_SECRET,
  callbackURL:   `${process.env.BACKEND_URL}/api/auth/auth0/callback`,
  state: true,   // CSRF protection via session
}, async (accessToken, refreshToken, extraParams, profile, done) => {
  // Normalize Auth0 profile into a consistent shape
  const formattedProfile = {
    emails: profile.emails || [{ value: profile._json.email }],
    name: {
      givenName:  profile._json.given_name  || profile.displayName?.split(' ')[0],
      familyName: profile._json.family_name || profile.displayName?.split(' ')[1] || '',
    },
    sub: profile.id,   // Auth0 unique user ID (used as googleId in DB)
  };
  return done(null, formattedProfile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
```

**Why `state: true`?** Prevents CSRF attacks by storing a random value in the session that must match when the callback arrives. This is why `express-session` must be enabled.

---

## Full Auth0 Login Flow

```
User clicks "Continue with Google" button
        │
        ▼
window.location.href = `${VITE_BACKEND_URL}/api/auth/auth0`
        │
        ▼
GET /api/auth/auth0
  └── passport.authenticate('auth0', { scope: 'openid email profile', prompt: 'login', session: true })
  └── Generates state param, stores in session
  └── Redirects user to Auth0 login page (Google login screen)
        │
        ▼  [User signs in with Google on Auth0's hosted page]
        │
        ▼
Auth0 redirects back to:
GET /api/auth/auth0/callback?code=...&state=...
  └── passport.authenticate('auth0', { session: true })
  └── Exchanges `code` for tokens using Auth0's token endpoint
  └── Fetches user profile from Auth0
  └── Calls our verify callback (normalizes profile)
  └── req.user = formattedProfile
        │
        ▼
auth0Login controller runs:
  email   = req.user.emails[0].value
  name    = req.user.name.givenName + ' ' + familyName
  googleId = req.user.sub  (Auth0 user ID, looks like "google-oauth2|123...")

  ┌─ User.findOne({ email }) ─────────────────────────────┐
  │                                                        │
  │  Not found?                                            │
  │    → User.create({ name, email, googleId,             │
  │                    isVerified: true })                 │
  │                                                        │
  │  Found, no googleId?                                   │
  │    → user.googleId = googleId                         │
  │    → user.isVerified = true                           │
  │    → user.save()                                      │
  │    (links existing email/password account to Google)   │
  │                                                        │
  │  Found with googleId?                                  │
  │    → user.isVerified = true  (ensure)                 │
  │    → user.save()                                      │
  └────────────────────────────────────────────────────────┘
        │
        ▼
generateToken(user._id)
  └── jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
        │
        ▼
res.redirect(`${FRONTEND_URL}/auth0-callback?token=<JWT>`)
```

---

## Frontend Callback Handling (`App.jsx`)

```
User lands on /auth0-callback?token=<JWT>
        │
        ▼
useEffect detects location.pathname === '/auth0-callback'
        │
        ▼
const token = new URLSearchParams(location.search).get('token')
        │
localStorage.setItem('token', token)
        │
        ▼
dispatch(userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }))
  └── GET /api/user/profile
  └── Populates full user in Redux state
        │
    ┌───┴───────┐
    │ Success?  │──Yes──► toast.success('Logged in!') → navigate('/')
    └───┬───────┘
        │ No
        ▼
localStorage.removeItem('token')
toast.error('Failed to authenticate')
navigate('/login')
```

The URL is cleaned immediately after extracting the token (`navigate(location.pathname, { replace: true })` implicit in the redirect to `/`), so the token never stays visible in the address bar.

---

## Why the Redirect Pattern?

Auth0's callback happens on the **backend** (port 5000), but the user's session lives on the **frontend** (port 3000 / Render deploy). We can't set an `httpOnly` cookie across origins reliably, so the backend redirects to the frontend with the JWT as a query param. The frontend picks it up and stores it in `localStorage` immediately.

This is a well-known pattern called the **"Authorization Code flow with token hand-off via redirect"**.

---

## User Account Linking

A user who registered with email/password (`user.googleId = null`) and then signs in with Google (same email) will have their account **linked automatically**:

```
Email/password user → clicks Google login with same email
    │
Auth0 callback → User.findOne({ email }) finds existing record
    │
user.googleId = googleId (Auth0 sub)
user.isVerified = true
user.save()
    │
Same account, now usable with both password AND Google
```

---

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AUTH0_DOMAIN` | Your Auth0 tenant domain (e.g. `dev-xxx.us.auth0.com`) |
| `AUTH0_CLIENT_ID` | Auth0 application Client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application Client Secret |
| `BACKEND_URL` | Full URL of backend (e.g. `https://language-exchange-backend.onrender.com`) |
| `FRONTEND_URL` | Full URL of frontend (e.g. `https://language-exchange-frontend.onrender.com`) |
| `SESSION_SECRET` | Random secret for express-session cookie signing |

---

## Auth0 Dashboard Setup (required)

In your Auth0 Application settings:
- **Application Type**: Regular Web Application
- **Allowed Callback URLs**: `https://<backend-url>/api/auth/auth0/callback` and `http://localhost:5000/api/auth/auth0/callback`
- **Allowed Logout URLs**: your frontend URL
- **Connections**: Google (enable under Social)

---

## Key Files

| File | Role |
|------|------|
| `backend/config/passportConfig.js` | Auth0 strategy setup, serialize/deserialize |
| `backend/controllers/authController.js` | `auth0Login` — finds/creates user, issues JWT, redirects |
| `backend/routes/authRoutes.js` | `GET /api/auth/auth0` and `/api/auth/auth0/callback` |
| `backend/server.js` | Wires up express-session, cookieParser, passport |
| `frontend/src/App.jsx` | Handles `/auth0-callback` route, extracts token from URL |
| `frontend/src/components/LoginModal.jsx` | "Continue with Google" button |
| `frontend/src/components/RegisterModal.jsx` | "Continue with Google" button |
