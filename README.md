# MFU Dorm Connect System — Production Setup

## What Was Built

A **fully production-ready full-stack web application** with:

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| i18n | i18next + react-i18next (EN/TH) |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcryptjs (no SSO, no Firebase) |
| File uploads | Multer |
| Security | Helmet + express-rate-limit + CORS |

---

## What Was Removed
- ✅ All SSO/OAuth logic removed
- ✅ All mock data removed
- ✅ All hardcoded UI text removed (replaced with i18n keys)
- ✅ All demo/simulation logic removed
- ✅ No Firebase, Auth0, Clerk, or any external auth service

## What Was Implemented
- ✅ Real JWT email/password auth (register, login, logout)
- ✅ bcrypt password hashing (12 rounds)
- ✅ SQLite database with full schema + migrations
- ✅ Real CRUD: Parcels, Repairs (with photo upload), Notifications, Announcements
- ✅ Repair Ticket IDs (sequential, stored in DB)
- ✅ Parcel state diagram: scanned → notified → ready → picked/returned
- ✅ PDPA-compliant Public Board (initials + room only, no full names)
- ✅ Full EN/TH language switching (i18next, persisted in localStorage + DB)
- ✅ Image uploads: profile avatar + repair photos (stored on disk)
- ✅ Rate limiting, Helmet security headers
- ✅ Production-ready error handling + input validation (frontend + backend)

---

## Folder Structure

```
mfu-dorm-connect/
├── package.json                  # Root scripts
├── backend/
│   ├── server.js                 # Express app entry
│   ├── .env.example
│   ├── package.json
│   ├── controllers/
│   │   ├── authController.js     # register, login, profile, avatar
│   │   ├── parcelController.js   # CRUD + status updates
│   │   ├── repairController.js   # CRUD + photo upload + ticket ID
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── db.js                 # SQLite schema + migration
│   │   └── migrate.js
│   └── routes/
│       ├── auth.js
│       ├── parcels.js
│       ├── repairs.js
│       └── notifications.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx              # Entry point
        ├── App.jsx               # Router + route guards
        ├── i18n.js               # i18next setup
        ├── index.css             # Global styles + MFU theme
        ├── locales/
        │   ├── en.json           # English translations
        │   └── th.json           # Thai translations
        ├── services/
        │   └── api.js            # Centralized axios API layer
        ├── hooks/
        │   ├── useAuth.jsx       # Auth context + provider
        │   └── useToast.js       # Toast notifications
        ├── components/
        │   ├── MobileLayout.jsx  # Phone frame + bottom nav
        │   └── Shared.jsx        # Spinner, Toast, Modal, Badge, etc.
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── HomePage.jsx
            ├── ParcelsPage.jsx
            ├── RepairPage.jsx
            ├── MyRepairsPage.jsx
            ├── QRCodePage.jsx
            ├── NotificationsPage.jsx
            ├── ProfilePage.jsx
            └── PublicBoardPage.jsx
```

---

## Quick Start (Step by Step)

### 1. Extract the zip
```bash
unzip mfu-dorm-connect.zip
cd mfu-dorm-connect
```

### 2. Set up Backend
```bash
cd backend

# Copy and edit environment variables
cp .env.example .env
# Edit .env — set a strong JWT_SECRET (min 64 chars)

# Install dependencies
npm install

# Run database migration (creates SQLite DB automatically)
npm run migrate

# Start backend server
npm start
# → API running on http://localhost:4000
```

### 3. Set up Frontend
```bash
cd ../frontend

# Copy and edit environment variables
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api  ← default, change if needed

# Install dependencies
npm install

# Development server (with proxy to backend)
npm run dev
# → Frontend at http://localhost:5173

# OR build for production
npm run build
# → Output in frontend/dist/
```

### 4. Production (Single Server)
```bash
# Build frontend first
cd frontend && npm run build

# Copy dist into backend for static serving
# (backend/server.js serves frontend/dist automatically when NODE_ENV=production)

cd ../backend
NODE_ENV=production npm start
# → Full app at http://localhost:4000
```

---

## Environment Variables

### backend/.env
```env
PORT=4000
JWT_SECRET=your_very_long_random_secret_here_at_least_64_characters
JWT_EXPIRES_IN=7d
DB_PATH=./data/mfu_dorm.db
UPLOAD_DIR=./uploads
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

### frontend/.env
```env
VITE_API_URL=http://localhost:4000/api
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login → JWT |
| GET | /api/auth/me | ✅ | Get profile |
| PUT | /api/auth/me | ✅ | Update profile |
| PUT | /api/auth/me/password | ✅ | Change password |
| POST | /api/auth/me/avatar | ✅ | Upload avatar |

### Parcels
| Method | Path | Description |
|---|---|---|
| GET | /api/parcels?history=false | Current parcels |
| GET | /api/parcels?history=true | History |
| POST | /api/parcels | Add parcel |
| PATCH | /api/parcels/:id/status | Update status |
| DELETE | /api/parcels/:id | Delete |

### Repairs
| Method | Path | Description |
|---|---|---|
| GET | /api/repairs | List repairs |
| POST | /api/repairs | Submit (multipart, photos) |
| PATCH | /api/repairs/:id/status | Update status |
| DELETE | /api/repairs/:id | Delete |

### Notifications
| Method | Path | Description |
|---|---|---|
| GET | /api/notifications | List |
| PATCH | /api/notifications/:id/read | Mark read |
| PATCH | /api/notifications/read-all | Mark all read |
| GET | /api/notifications/announcements | List announcements |
| POST | /api/notifications/announcements | Create announcement |

---

## Database Schema (SQLite)

- **users** — id, full_name, student_id, email, password_hash, dorm_building, room_number, avatar_url, language
- **parcels** — id, user_id, tracking_number, carrier, status (scanned/notified/ready/picked/returned)
- **repair_requests** — id, ticket_id, user_id, category, description, status, photo_urls (JSON), assigned_to
- **notifications** — id, user_id, type, title_en, title_th, body_en, body_th, is_read
- **announcements** — id, title_en, title_th, body_en, body_th, target_building
- **ticket_counter** — auto-incrementing repair ticket IDs

---

## Security Measures

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens, 7-day expiry, verified per request
- **Helmet** — sets secure HTTP headers
- **Rate limiting** — 20 login attempts / 15 min; 10 registrations / hour
- **CORS** — configurable via FRONTEND_URL env var
- **PDPA compliance** — Public board never exposes full names (initials + room only)
- Input validation on both frontend and backend
- File upload restricted to images only, 5–10MB limit

---

## Assumptions Made

1. SQLite is acceptable for this scale (≤1000 concurrent users). Swap to PostgreSQL by replacing `better-sqlite3` with `pg` and updating query syntax.
2. File uploads are stored to local disk (`./uploads/`). In production, replace with S3 or similar object storage.
3. The public board reads from the logged-in user's own parcels. In a real multi-user staff system, add a staff role and separate parcel management endpoint.
4. JWT is stateless — no token blacklisting on logout (token expires naturally). Add Redis for blacklisting if needed.
5. Notification delivery is in-app only (no push notifications/SMS). Extend with Firebase Cloud Messaging for real push.
