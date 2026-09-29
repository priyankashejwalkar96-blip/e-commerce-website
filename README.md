# Production-Grade E-Commerce Platform

A production-grade, fully functional e-commerce platform built with Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Supabase, and Razorpay.

## 🌟 Key Features

### Storefront
- **Design System**: Agency-grade aesthetics inspired by Apple, Aesop, and Rapha. Custom typography, warm off-white palette (`#FAFAFA`), subtle shadows, and 8px layout grid.
- **Hero Carousel**: Auto-rotating hero slides with word-by-word reveal animations.
- **Flying Add-To-Cart**: Orchestrated 3D bezier arc animation of product ghost images into header cart icon.
- **Slide-Over Cart Drawer**: Height collapse animations for item deletion, live subtotal calculations, and coupon application validation.
- **Product Listing Page (PLP)**: Real-time filtering by category, price slider, sale status, and sorting with shareable URL parameters.
- **Product Detail Page (PDP)**: Crossfading image gallery with hover zoom, option swatches, quantity selectors, expandable specification accordions, and verified customer review submissions.
- **Multi-Step Checkout & Razorpay**: Step-by-step shipping form, tax/shipping calculations, and Razorpay payment intent integration.
- **Instant Search Modal**: Debounced instant catalog search with recent search term persistence in `localStorage`.
- **User Dashboard & Wishlist**: Order history timeline, wishlist heart toggle, and profile settings.

### Admin Panel (`/admin`)
- **Role-Protected**: Protected layout checking `role === 'admin'` in user profiles.
- **Analytics Dashboard**: Interactive Recharts revenue trends, KPI counter cards, recent order table, and low-stock alerts.
- **Product Management**: Full CRUD product creation with auto-slugification, SKU tracking, pricing, and media uploads.
- **Order Management**: Fulfillment status update dropdowns (Pending -> Shipped -> Delivered) with live tracking number entry.
- **Category & Coupon Management**: Create promo codes (`LUXE15`, `WELCOME50`) with minimum spend constraints and category trees.
- **Brand & Site Settings**: Customize brand logos, header announcement bar text/colors, contact info, and social links without code changes.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **Animations**: Framer Motion
- **Database & Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Payments**: Razorpay
- **Icons**: Lucide React
- **Charts**: Recharts

---

## 🚀 Getting Started

### 1. Installation

Dependencies have already been installed. To start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to SQL Editor in your Supabase Dashboard and run the contents of `supabase/schema.sql`.
3. Optionally run `supabase/seed.sql` to populate sample categories, hero slides, and promo coupons.
4. Copy your project URL and keys to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Razorpay Setup

1. Sign up for a Razorpay Test account at [razorpay.com](https://razorpay.com).
2. Generate your API Keys under Settings -> API Keys.
3. Add your Key ID and Key Secret to `.env.local`:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxxx
```
