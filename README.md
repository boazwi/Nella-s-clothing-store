# Nella's Clothing Store — Frontend

E-commerce clothing storefront with an **AI virtual try-on**: shoppers upload a
photo of themselves, pick a garment, and see a generated image of themselves
wearing it. Built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

See [PRD.md](PRD.md) for product requirements and [SPEC.md](SPEC.md) for the
technical design.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # already created for local dev
npm run dev
```

Open http://localhost:3000.

## Environment

| Variable | Scope | Purpose |
|---|---|---|
| `TRYON_WEBHOOK_URL` | **Server only** | n8n virtual try-on webhook. Called by `app/api/try-on/route.ts`; never exposed to the browser. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser) | Supabase project API URL, used by the auth client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser) | Supabase publishable/anon key. Safe to expose — access is governed by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Bypasses RLS. Used only in `src/lib/supabase/serverAdmin.ts` for the Stripe webhook and the try-on entitlement check. Never expose to the browser. |
| `STRIPE_SECRET_KEY` | **Server only** | Stripe SDK client in `app/api/stripe/webhook/route.ts`. |
| `STRIPE_WEBHOOK_SECRET` | **Server only** | Verifies the Stripe webhook signature. |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL` | Public (browser) | The recurring $9.99/month Stripe Payment Link, used to build the checkout URL after signup. |

Set these in **both** places — they're independent:
- Locally: `.env.local` (gitignored, not deployed).
- Deployed: Vercel project → **Settings → Environment Variables** (Production + Preview).
  Adding/changing it there requires a **new deployment** (a fresh commit, or
  "Redeploy" without reusing the build cache) to take effect.

## Deployment

Hosted on **Vercel** at `nella-s-clothing-store.vercel.app`, deployed from GitHub
`boazwi/Nella-s-clothing-store` (`origin`/`main`). Pushing to `main` triggers a
new production deployment automatically.

## Virtual try-on flow

1. The client posts `image1` (person) + `image2` (garment) as `multipart/form-data`
   to the internal route **`/api/try-on`**.
2. That server route forwards the request to `TRYON_WEBHOOK_URL` (hiding the URL
   and avoiding CORS), then streams the returned **binary image** back.
3. The client renders the image and offers a download.
4. **Upload size guard:** Vercel serverless functions cap request bodies at 4.5 MB.
   Any image over 3 MB is automatically downscaled (max 1600px) and re-encoded as
   JPEG client-side before upload (`compressImageFile` in `src/lib/image.ts`) —
   silent, no user action needed.

## Authentication (Supabase Auth)

Real customer accounts via **Supabase Auth**, behind the `AuthService` seam in
`src/services/auth` (`supabaseAuthService`; the localStorage `mockAuthService`
remains only as a test double).

- **Sign up** with full name + email + password → **log in** / **log out**.
- Full name is stored in Supabase **user metadata** (`user_metadata.full_name`).
- **Admin role** is derived from the `@admin.nella` email convention (real role
  management via `app_metadata` + RLS is future scope).
- **Email confirmation is disabled** (immediate login) — a Supabase dashboard
  setting (Authentication → Sign In / Providers → Email → "Confirm email" off).
- Session persists in the browser and syncs via `onAuthStateChange`.

## Paywall (Stripe subscription)

Try-on requires an active **$9.99/month subscription**, paid via a Stripe Payment Link.

1. After signup, the browser redirects to the Stripe Payment Link with
   `client_reference_id`/`prefilled_email` appended so the webhook can match the
   payment to the Supabase user.
2. `POST /api/stripe/webhook` (subscribed to `checkout.session.completed`,
   `invoice.payment_succeeded`, `invoice.payment_failed`,
   `customer.subscription.updated`, `customer.subscription.deleted`) is the source
   of truth: it upserts the `subscriptions` table, appends an audit row to
   `payments`, and mirrors status onto the user's `app_metadata`.
3. Stripe redirects back to `/payment-success`, which refreshes the session and
   routes to `/try-on`.
4. **Real enforcement is server-side**: `app/api/try-on/route.ts` verifies the
   caller's Bearer token and re-reads the *live* `subscriptions` row on every
   request (401 unauthenticated, 402 not subscribed/lapsed). Client-side gating
   (`RequireAuth requirePaid`, redirecting to `/payment-required`) is UX only.
5. On a lapse (`past_due`/`canceled`/`unpaid`), the webhook flips `app_metadata`
   and best-effort revokes sessions (`src/lib/supabase/revokeSessions.ts`) — access
   is blocked immediately regardless of whether that revocation succeeds, since
   step 4 checks live DB state on every try-on call.
6. `subscriptions` and `payments` have **RLS enabled with zero client policies** —
   only the service-role key (`src/lib/supabase/serverAdmin.ts`) can read or write
   them. `GET /api/me/subscription` is the only sanctioned path from the client to
   this data (status + renewal date only, for the `/payment-required` messaging).

## Placeholders (this release)

- **Products** are seeded in memory behind `src/services/products` (resets on reload).

Product data sits behind a swappable service interface, so a real backend (e.g.
Supabase) can replace it without UI changes. See future scope in the PRD.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; try-on webhook mocked) |
