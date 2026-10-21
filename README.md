# 🏰 HavenStone Estates - Luxury Real Estate & Brokerage Platform

A production-ready, full-stack luxury real estate application built with **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, **PostgreSQL**, and **NextAuth.js v5 (Auth.js)**. 

The platform supports multi-role access control tailored for **High-Net-Worth Buyers**, **Licensed Agents & Sellers**, and **Super Admins**.

---

## 🌟 Key Features & Role Architecture

### 👤 1. High-Net-Worth Buyers (`BUYER`)
- **Curated Residences Portfolio (`/properties`)**: Filter estates by price range, property type (Villa, Penthouse, House, Apartment), bedrooms, bathrooms, and city.
- **Dynamic Property Detail Showcase (`/properties/[slug]`)**: High-resolution gallery, comprehensive specs (sqft, year built, garage), interactive OpenStreetMap location, and verified seller verification card.
- **Private Showing Booking**: Schedule in-person or virtual video tours with automated seller email/SMS notifications.
- **Instant WhatsApp & Tel Integration**: Direct 1-click WhatsApp messaging (`#25D366`) and phone calling directly connected with the verified listing owner.
- **Saved Wishlist (`/favorites`)**: Real-time favorite and bookmark toggle with instant synchronization.

---

### 💼 2. Licensed Agents & Sellers (`AGENT` / `SELLER`)
- **Agent Command Center (`/dashboard`)**:
  - Executive sales analytics: Managed portfolio valuation, active listings count, unread appointment leads, and total property views.
  - Showing requests activity desk with one-click direct communication actions.
- **Sales Inventory Desk (`/dashboard/properties`)**:
  - Live status badges: `APPROVED`, `UNDER REVIEW` (`PENDING_APPROVAL`), `SOLD`, or `REJECTED`.
  - Toggle between Grid and Table views.
  - Direct quick actions: Edit residence details, pause/resume listing, mark as sold, or delete.
- **5-Step Interactive Listing Wizard (`/dashboard/properties/new`)**:
  - Step 1: Basic specifications (title, type, asking price, currency, description).
  - Step 2: Interior & exterior amenities (pool, private elevator, helipad, wine vault, etc.).
  - Step 3: Precise location with interactive pin-drop map coordinates.
  - Step 4: Photo drag-and-drop uploader (Cloudinary integration) & video tour URL.
  - Step 5: Direct seller contact phone & WhatsApp toggle with real-time validation.
- **Leads & Inquiries Inbox (`/dashboard/inquiries`)**:
  - Track incoming showing appointments with buyer contact details and requested tour timestamps.
  - Filter by `NEW`, `CONTACTED`, `SCHEDULED`, `COMPLETED`, or `ARCHIVED`.

---

### 🛡️ 3. Super Admin Executive (`ADMIN`)
- **Control Center Overview (`/admin`)**:
  - Platform-wide KPI cards: Total platform valuation ($M+), active listings count, pending reviews, registered sellers & buyers.
- **Moderation Queue (`/admin/properties/pending`)**:
  - Review newly submitted properties awaiting public publication.
  - Photo and specifications inspection drawer.
  - One-click **Approve Listing** or **Reject** with custom feedback sent to the seller.
- **Global Inventory Manager (`/admin/properties`)**:
  - Instant search across all platform residences by title, seller, or city.
  - Toggle **Featured Property** to curate the homepage hero selections.
- **Users & Sellers Directory (`/admin/users`)**:
  - Audit accounts, track activity, and inspect verification badges.
- **Global Inquiries Pipeline (`/admin/inquiries`)**:
  - Audit all prospective buyer inquiries and communication logs.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Actions, Turbopack) |
| **UI Library** | React 19, Tailwind CSS v4, Framer Motion |
| **Icons & Alerts** | Lucide React, Sonner Toasts |
| **Database & ORM** | PostgreSQL, Prisma ORM 6 |
| **Authentication** | NextAuth.js v5 (Beta 32) with JWT sessions & Prisma Adapter |
| **Form Validation** | Zod v4 schemas |
| **Mapping** | Leaflet & OpenStreetMap (Pin-Drop Coordinates) |
| **Smooth Scrolling** | Lenis Scroll |

---

## 🔒 Security & Route Protection

Protected via Next.js Edge Middleware (`middleware.ts`) and Server Action authorization guards:

- `/admin/*` ➔ Restricted strictly to `role === "ADMIN"`.
- `/dashboard/*` ➔ Restricted to verified `AGENT`, `SELLER`, and `ADMIN` accounts.
- `/sell` & `/dashboard/seller/*` ➔ Automatically routed into the consolidated Agent Dashboard.
- `/profile` & `/favorites` ➔ Protected for authenticated users.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ZainMurtaza3532/Real-Estate-Website.git
cd Real-Estate-Website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):

```env
# Database URL (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/real_estate_db?schema=public"

# NextAuth / Auth.js v5 Configuration
AUTH_SECRET="your-generated-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Credentials (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Cloudinary Media Storage (Optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Database Migration & Seed
Run Prisma migrations to initialize database tables and seed luxury properties and demo accounts:

```bash
# Push schema to database
npx prisma db push

# Seed demo properties, users, and admin
npx prisma db seed
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── actions/                  # Server action wrappers & client helpers
├── app/
│   ├── (public-pages)/       # Public showcase homepage
│   ├── actions/              # Core server actions (admin, property, seller)
│   ├── admin/                # Super Admin control center (/admin)
│   ├── api/                  # Authentication & media upload API routes
│   ├── dashboard/            # Agent command center & listing wizard (/dashboard)
│   ├── favorites/            # Saved residences wishlist
│   ├── login/ & signup/      # Authentication pages
│   ├── profile/              # User account profile
│   ├── properties/           # Public catalogue & dynamic detail pages
│   └── unauthorized/         # Access denied view
├── components/
│   ├── admin/                # Admin sidebar, topbar, queue & inventory tables
│   ├── dashboard/            # Agent dashboard navigation tabs
│   ├── properties/           # Property cards, filters, seller cards, tour forms
│   ├── seller/               # 5-step SellWizard, pin-drop map, media uploader
│   └── ui/                   # Reusable UI primitives (badges, buttons, modals)
├── lib/                      # Prisma client, notification utilities
├── prisma/                   # Prisma schema & seed script
└── types/                    # NextAuth type augmentations
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Compiles production build.
- `npm run start`: Starts production server.
- `npm run lint`: Runs ESLint code style and syntax checks.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
