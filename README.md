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
