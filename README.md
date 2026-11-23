# StayNear — Premium PG Accommodation Discovery & Management Platform

**StayNear** is an editorial-style, full-stack PG (Paying Guest) accommodation discovery and property management platform. Inspired by the visual restraint, oversized typography, whitespace, and art-directed elegance of [TAL](https://tal.club/), StayNear brings confidence, clarity, and trust to student and working professional housing in Bengaluru, starting around Christ University, Koramangala, SG Palya, and adjacent hubs.

---

## 🌟 Key Product Distinctions

1. **TAL-Inspired Editorial Visual System:**
   - Palette: `#111111` Near Black, `#FFFFFF` Pure White, `#F5F4F0` Warm Off-White, `#758C7C` Muted Sage, `#DCEBE3` Light Sage, `#E9E5DE` Warm Sand, `#D7A45C` Muted Gold, `#C85C52` Soft Red.
   - Typography Pairing: Manrope / Plus Jakarta Sans for confident, tight-spaced headlines and Inter for clean body copy.
   - Restrained animations via Framer Motion, zero decorative emoji substitutes, and refined hover/focus states.

2. **Strict Two-Tier Verification Governance:**
   - **Tier 1 (Owner Approval):** PG owners must register, submit government identity documents (Aadhaar, PAN, Passport), and provide property ownership / lease deeds.
   - **Tier 2 (Property Approval):** Individual listings require separate administrative moderation before becoming visible on the public directory.
   - Private owner verification documents are stored securely in isolated storage and are never publicly accessible.

3. **Pure Discovery & Visit Engine:**
   - **Zero Online Rent or Deposit Payments:** StayNear focuses purely on discovery, direct communication, and physical walkthrough scheduling.
   - **Interactive Visit Scheduling:** Students request dates and time slots; owners confirm, decline, or propose alternate reschedules.

4. **Multi-Role Portal Access:**
   - **Public:** Free browsing, searching, and filtering without mandatory account creation.
   - **Students:** Save favourites, submit enquiries, schedule visits, and manage student preferences.
   - **Owners:** Verification onboarding, 6-step property listing wizard, enquiry responder, and visit calendar.
   - **Administrators:** Platform telemetry, owner identity audit, listing moderation, user suspension/reactivation, and safety reports.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Axios, React Router DOM v6.
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs password hashing, Helmet, CORS, Multer.
- **Database:** MongoDB with Mongoose ODM.
  - **Zero-Config Local Development:** Seamless automatic fallback to in-memory MongoDB (`mongodb-memory-server`) with auto-seeding if no `MONGODB_URI` is provided!
  - **Production Ready:** Plug in any MongoDB Atlas connection string.

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Installation
Clone repository and install dependencies across root, server, and client:
```bash
# Install root, server, and client dependencies
npm run install:all
```
*(Or navigate into `server` and `client` respectively and run `npm install`)*

### 2. Environment Configuration
Both `server/.env` and `server/.env.example` are pre-configured:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=staynear_master_jwt_secret_dev_key_2026_xyz
# Leave blank to use zero-config in-memory database, or specify your Atlas cluster:
MONGODB_URI=
CLIENT_URL=http://localhost:5173
```

### 3. Run Development Servers
Start both backend API and client Vite server simultaneously from root:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-populated with realistic Bengaluru PG properties and test accounts. Use the one-click demo login buttons on the `/login` screen or use the credentials below:

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Platform Administrator** | `admin@staynear.com` | `Admin@12345` | Review owner ID documents, approve/reject listings, moderate users & reports |
| **Verified PG Owner** | `owner@staynear.com` | `Owner@12345` | Approved owner with active listings, manage enquiries, confirm visit requests |
| **Pending PG Owner** | `newowner@staynear.com` | `Owner@12345` | Application under review; demonstration of unverified owner restrictions |
| **Student** | `student@staynear.com` | `Student@12345` | Saved properties, submitted enquiries, scheduled visits, profile management |

---

## 🧭 Application Routes

### Public Experience
- `/`: Editorial Homepage with search bar, featured stays, categories, How It Works, and FAQs.
- `/explore`: Real-time search, multi-faceted filtering (budget, locality, sharing, food, amenities), sorting, and responsive drawer.
- `/property/:id`: High-res gallery, room specifications, food menu, house rules, location map, and sticky visit/inquiry booking card.
- `/about`: StayNear philosophy, problem statement, and student-first values.
- `/contact`: Support inquiry form.
- `/list-property`: High-conversion owner landing page.

### Authentication
- `/login`: Clean login form with one-click demo switchers.
- `/register`: Student / Owner role toggle with validation.
- `/forgot-password`: Account recovery request.

### Dashboards
- `/student/dashboard`: Overview, Saved PGs, My Enquiries, Visit Appointments, and Housing Preferences.
- `/owner/dashboard`: Metrics, My Properties, 6-Step Property Listing Wizard, Enquiries, and Visit Requests.
- `/owner/apply`: Identity document & property proof submission.
- `/admin/dashboard`: Platform telemetry, Owner Verification queue, Property Moderation, User Controls, and Safety Reports.

---

## 🛡️ Security & Privacy Guardrails

1. **Private Verification Storage:** Owner government ID documents and property tax receipts are stored privately and accessible only through authenticated administrative proxy routes (`/api/admin/documents/:filename`).
2. **Strict Role-Based Authorization:** Every mutating operation (listing creation, status updates, user moderation) is validated via backend JWT middleware.
3. **Password Security:** Salted hashing with `bcryptjs` (cost factor 10).
4. **Input Sanitization & Rate Limiting:** Brute-force protection on authentication endpoints.

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
1. Push project to GitHub.
2. In Vercel, import the repository and set **Root Directory** to `client`.
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Add environment variable: `VITE_API_URL=https://your-backend-api.onrender.com`.

### Backend (Render / Railway)
1. In Render, create a new Web Service pointing to `server`.
2. Build Command: `npm install` and Start Command: `node server.js`.
3. Configure Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`).
