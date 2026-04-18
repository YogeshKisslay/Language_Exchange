# Authentication Flow

## Overview

The app uses **JWT (JSON Web Token)** for stateless authentication. There are two ways to authenticate:
1. Email + Password (manual registration with optional email verification)
2. Auth0 / Google OAuth (covered in `auth0.md`)

Both methods end up issuing the same kind of JWT, stored in `localStorage` on the frontend.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Token format | JWT (7-day expiry, signed with `JWT_SECRET`) |
| Password hashing | bcryptjs (salt rounds: 10) |
| Token storage | `localStorage` (key: `token`) |
| Frontend state | Redux (`authSlice`) |
| API layer | RTK Query (`authApi`, `userApi`) |

---

## Registration Flow

```
User fills Register form
        │
        ▼
POST /api/auth/register
        │
  ┌─────┴──────┐
  │ Duplicate? │──Yes──► 400 "User already exists"
  └─────┬──────┘
        │ No
        ▼
bcrypt.hash(password, 10)
        │
        ▼
User.create({ name, email, hashedPassword, isVerified: BYPASS_EMAIL })
        │
  ┌─────┴────────────────┐
  │ BYPASS_EMAIL = true? │──Yes──► 201 "Registration successful"
  └─────┬────────────────┘         (isVerified = true immediately)
        │ No
        ▼
sendVerificationEmail(user)
  └── JWT signed with user._id (7d expiry)
  └── Email link: GET /api/auth/verify/:token
        │
        ▼
User clicks email link
POST /api/auth/verify/:token
  └── jwt.verify(token) → decode user._id
  └── user.isVerified = true
  └── redirect to FRONTEND_URL
```

**`BYPASS_EMAIL` env flag**: When `true`, email verification is skipped and the user is marked verified on registration. Used for local development or deployment environments where an email server is not configured.

---

## Login Flow

```
User fills Login form
        │
        ▼
POST /api/auth/login  { email, password }
        │
  ┌─────┴──────────────────────────────┐
  │ User not found OR not verified?    │──Yes──► 401
  │ (unless BYPASS_EMAIL=true)         │
  └─────┬──────────────────────────────┘
        │
  ┌─────┴──────────────┐
  │ user.googleId set? │──Yes──► 400 "Use Auth0 login instead"
  └─────┬──────────────┘
        │
bcrypt.compare(password, user.password)
        │
  ┌─────┴──────┐
  │  No match? │──Yes──► 401
  └─────┬──────┘
        │
generateToken(user._id)  ← jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" })
        │
        ▼
200 { token, user: { _id, name, email, knownLanguages, learnLanguages, powerTokens, coinTokens, premium } }
```

**Frontend (LoginModal.jsx):**
```
login({ email, password })
    │
    ▼
localStorage.setItem('token', token)
dispatch(setCredentials({ token, user }))
    │
    ▼
userApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
    │        ← fetches full user object from /api/user/profile
    ▼
navigate('/')
```

---

## Token Attachment (All API calls)

Every authenticated request attaches the JWT via a custom Redux base query in `authApi.js` / `userApi.js`:

```js
prepareHeaders: (headers) => {
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}
```

**Backend middleware** (`authMiddleware.js`) verifies every protected route:
```
Authorization: Bearer <token>
    │
jwt.verify(token, JWT_SECRET)
    │
User.findById(decoded.id).select('-password')
    │
req.user = user   ← attached for use in controllers
```

---

## Logout Flow

```
User clicks Logout
    │
    ▼
POST /api/user/logout  (clears cookie if any, sets user.isOnline = false)
    │
    ▼
Frontend:
  localStorage.removeItem('token')
  dispatch(clearCredentials())
  socket.disconnect()
```

---

## Profile Fetching

After login or on app boot, the frontend calls `GET /api/user/profile` (no userId in URL = own profile). This is the single source of truth for the user object in Redux. It's called:
- After login (manual or Auth0)
- After app loads (via RTK Query's `getProfile` hook)
- After any action that modifies the user (end call, payment, extend call)

---

## Password Reset Flow

```
User clicks "Forgot Password" → enters email
    │
POST /api/auth/forgot-password { email }
    │
sendVerificationEmail(user, "reset")
    └── JWT signed with user._id
    └── Email link: POST /api/auth/reset-password/:token
    │
User clicks link → opens ResetPassword page
    │
POST /api/auth/reset-password/:token  { newPassword }
    │
jwt.verify(token) → user._id
bcrypt.hash(newPassword) → user.password
user.save()
    │
200 "Password updated successfully"
    │
navigate('/login')
```

**Note:** Password reset is disabled when `BYPASS_EMAIL=true` (returns 503).

---

## Key Files

| File | Role |
|------|------|
| `backend/controllers/authController.js` | register, login, verify, reset, logout handlers |
| `backend/middleware/authMiddleware.js` | JWT verification on all protected routes |
| `backend/routes/authRoutes.js` | Route definitions |
| `frontend/src/redux/services/authApi.js` | RTK Query for auth endpoints |
| `frontend/src/redux/services/userApi.js` | RTK Query for profile + user endpoints |
| `frontend/src/redux/slices/authSlice.js` | Redux state: `{ user, token, isAuthenticated, callStatus }` |
| `frontend/src/components/LoginModal.jsx` | Login UI |
| `frontend/src/components/RegisterModal.jsx` | Registration UI |
| `frontend/src/components/ResetPassword.jsx` | Password reset UI |
