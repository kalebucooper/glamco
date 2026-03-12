# glam.co

A full-stack makeup artist marketplace — find, book, and shop with exceptional artists.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Payments | Stripe + Stripe Connect |
| Styling | Tailwind CSS |
| State | Zustand (cart) |
| Forms | React Hook Form + Zod |
| Language | TypeScript |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yourname/glamco.git
cd glamco
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run it — this creates all tables, enums, RLS policies, and triggers
4. Enable **Google OAuth** in Authentication → Providers (optional)
5. Copy your project URL and anon key

### 3. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Enable **Stripe Connect** in your dashboard (Settings → Connect)
3. Get your publishable and secret keys from the Developers tab
4. Set up a webhook endpoint pointing to `/api/webhooks/stripe`
   - Listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.succeeded`, `account.updated`

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_FEE_PERCENT=15
```

### 5. Run the development server

```bash
npm run dev
```

To test Stripe webhooks locally:
```bash
npm run stripe:listen
```

---

## Project Structure

```
glamco/
├── app/
│   ├── api/
│   │   ├── bookings/create/     ← Create booking + Stripe PaymentIntent
│   │   ├── checkout/            ← Product order + PaymentIntent
│   │   ├── artists/connect/     ← Stripe Connect onboarding
│   │   └── webhooks/stripe/     ← Handle all Stripe events
│   ├── auth/
│   │   ├── login/               ← Email + Google login
│   │   └── signup/              ← Role selection (client or artist)
│   ├── artist/[id]/             ← Artist profile + portfolio + booking
│   ├── dashboard/               ← Client/artist dashboard with earnings
│   └── shop/                    ← Product marketplace
├── components/
│   ├── booking/BookingForm.tsx  ← Multi-step booking with Stripe Elements
│   ├── layout/Navbar.tsx
│   ├── providers/
│   │   ├── SupabaseProvider.tsx ← Auth context
│   │   └── CartProvider.tsx     ← Zustand cart (persisted)
│   └── ui/Toaster.tsx
├── lib/
│   ├── supabase.ts              ← Client + server Supabase instances
│   └── stripe.ts                ← Stripe client + helpers
├── types/index.ts               ← All TypeScript types
└── supabase/migrations/
    └── 001_initial_schema.sql   ← Full database schema
```

---

## How Payments Work

### Bookings (Stripe Connect)
1. Client submits booking form
2. Server creates a **booking record** in Supabase (status: `pending`)
3. Server creates a **PaymentIntent** with `transfer_data.destination` pointing to the artist's Stripe account
4. The **15% platform fee** is taken via `application_fee_amount`
5. Client completes payment via Stripe Elements
6. Webhook receives `payment_intent.succeeded` → booking status updated to `confirmed`
7. Artist receives **85%** automatically via Stripe Connect transfer

### Products (Standard Stripe)
1. Cart items submitted to `/api/checkout`
2. Order created in Supabase, PaymentIntent created
3. Client pays via Stripe Elements
4. Webhook confirms order → status set to `paid`

---

## Key Features

- **Role-based auth** — clients and artists see different dashboards
- **Stripe Connect Express** — artists onboard in minutes, receive payouts automatically
- **15% platform fee** — automatically split via Stripe's application_fee_amount
- **Row Level Security** — artists can only edit their own data; clients only see their own bookings
- **Real-time booking status** — webhook updates database immediately on payment events
- **Persistent cart** — survives page refresh via localStorage (Zustand persist)
- **Genre-based discovery** — wedding, glam, drag, editorial, SFX, avant-garde, and more

---

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel deploy
```

Add all environment variables in Vercel's dashboard.

Update your Stripe webhook URL to your production domain.

---

## Platform Economics

| Transaction | Amount |
|---|---|
| Client pays | $500 |
| Platform fee (15%) | $75 |
| Artist receives | $425 |

All splits happen automatically via Stripe Connect — no manual payouts needed.
