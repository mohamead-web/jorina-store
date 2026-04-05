# JORINA

Luxury cosmetics e-commerce experience built with `Next.js 16`, `React 19`, `TypeScript`, `Tailwind CSS`, `Framer Motion`, `Prisma`, `PostgreSQL`, and `Auth.js`.

The project is:
- Arabic-first
- RTL/LTR ready
- Mobile-first
- Full-stack via Next.js App Router
- Structured for future payments, admin tools, and localization growth

## Stack

- `Next.js App Router`
- `TypeScript`
- `Tailwind CSS`
- `Framer Motion`
- `Prisma`
- `PostgreSQL`
- `Auth.js / NextAuth`
- `next-intl`

## Main Features

- Luxury editorial homepage for JORINA
- Product catalogue, categories, search, new arrivals, best sellers, and offers
- Product details with gallery, variants, wishlist, cart, and details tabs
- Persistent cart structure for guest and authenticated users
- Cash on delivery checkout flow
- Google sign-in architecture via Auth.js
- Account dashboard, orders, returns, favorites, addresses, and preferences
- Arabic and English locale structure under `/ar` and `/en`
- Country and language preference saving
- SEO basics with metadata, `robots.txt`, and `sitemap.xml`

## Environment Variables

Copy `.env.example` to `.env` and fill in the values you need:

```env
DATABASE_URL="postgresql://jorina:jorina@localhost:5433/jorina?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DEFAULT_LOCALE="ar"
DEFAULT_COUNTRY="SA"
```

Notes:
- Google login stays safely inactive until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are provided.
- Cash on delivery works without any payment gateway setup.

## Local Run

### Option 1: Docker Compose for PostgreSQL

If Docker is available on your machine:

```bash
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Then open:

- [http://localhost:3000/ar](http://localhost:3000/ar)
- [http://localhost:3000/en](http://localhost:3000/en)

### Option 2: Local PostgreSQL

If Docker is not installed:

1. Create a PostgreSQL database manually.
2. Update `DATABASE_URL` in `.env`.
3. Run:

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

## Database Commands

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

If you want a migration instead of `db push`, run:

```bash
npx prisma migrate dev --name init
```

## Build Check

Production build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Important Paths

- `app/[locale]` locale-based routes
- `components/` reusable UI and page sections
- `lib/services/` catalog, cart, orders, returns, preferences
- `lib/actions/` server actions
- `prisma/schema.prisma` database schema
- `prisma/seed.ts` mock bilingual seed data
- `public/assets/` local visual placeholders and product art

## Authentication

- Primary auth flow: `Google Sign-In`
- Session persistence: database-backed Auth.js sessions
- Account routes are protected

## Current Payment Setup

- `Cash on Delivery` only in v1
- Checkout architecture is prepared for future payment gateways

## Notes

- The included product and category data are realistic mock seed entries for development.
- The current logo asset is loaded from the provided JORINA brand logo and stored under `public/brand/jorina-logo.jpeg`.
- Docker PostgreSQL in this project uses host port `5433` to avoid conflicts with any local PostgreSQL service already using `5432`.
Fresh start
