# Project: Nella's Clothing Store (חנות הבגדים של נלה)

Frontend for a clothing e-commerce site whose signature feature is an **AI
virtual try-on**. Full detail lives in [PRD.md](PRD.md) (product) and
[SPEC.md](SPEC.md) (engineering). This file is the quick, durable summary of
decisions that are easy to forget.

## Stack
- **Next.js (App Router) + TypeScript (strict) + Tailwind CSS**
- React Query (server state), React Hook Form + Zod (forms), lucide-react (icons)
- Fonts: Playfair Display (headings) + Inter (body) via `next/font`
- Package manager: **npm**. Hosted on **Vercel** at `nella-s-clothing-store.vercel.app`,
  deployed from GitHub `boazwi/Nella-s-clothing-store` (`origin`/`main`) — pushing to
  `main` triggers a new deployment.

## Virtual try-on — the core feature
- Client posts `multipart/form-data` to the **internal** route `app/api/try-on/route.ts`,
  which proxies to the n8n webhook. Never call the webhook directly from the browser.
- **Image mapping (confirmed):** `image1` = person photo, `image2` = garment.
- Webhook URL is the **server-only** env var `TRYON_WEBHOOK_URL` (no `NEXT_PUBLIC_`).
  Set in `.env.local` locally (gitignored) **and separately in Vercel → Settings →
  Environment Variables** (Production + Preview) — `.env.local` never reaches the
  deployment, so this must be set in both places. Vercel env var changes need a
  fresh deploy (a new commit, not just "Redeploy" with cached build) to take effect.
  The proxy hides the URL and avoids CORS.
- Backend returns a **binary image**; the client renders it via an object URL.
- **Raster only:** the backend rejects **SVG**. The garment image is normalized to
  **PNG** on the client (canvas) before upload — see `imageUrlToPngFile` in
  `src/lib/image.ts`. Person photos must be JPG/PNG/WebP (validated, SVG excluded).
- **Upload size cap:** Vercel serverless functions hard-limit request bodies to
  4.5 MB. Any file (person photo or garment image) over 3 MB is automatically
  downscaled (max 1600px) and re-encoded as JPEG client-side before upload —
  see `compressImageFile` in `src/lib/image.ts` and thresholds in
  `src/lib/constants.ts`. Runs silently; no user-facing step.

## Auth — real accounts via Supabase Auth
- Customers **sign up** (full name + email + password), **log in**, and **log out**.
  Backed by **Supabase Auth** through the `AuthService` seam in `src/services/auth`
  (`supabaseAuthService`); `mockAuthService` is retained only as a test double. Swap
  the single binding in `src/services/auth/index.ts` to change backends — no UI changes.
- Browser client: `src/lib/supabase/client.ts` (session in localStorage, auto-refresh).
  `AuthContext` subscribes to `onAuthStateChange` for live session sync.
- **Full name** is stored in Supabase **user metadata** (`user_metadata.full_name`),
  not a profiles table (yet). **Admin role** is still derived client-side from the
  `@admin.nella` email convention (real role hardening via `app_metadata` + RLS is future).
- **Email confirmation is OFF** (immediate login) — a Supabase dashboard setting.
- Env vars (public, browser-safe): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Set in `.env.local` **and** Vercel (Production +
  Preview), same rules as `TRYON_WEBHOOK_URL`.

## Paywall — $9.99/month Stripe subscription gating try-on
- Try-on requires an **active subscription**. After signup, `AuthForm` does a full
  navigation (`window.location.href`, not `router.push`) to the Stripe **Payment
  Link** (`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL`), appending
  `client_reference_id=<supabase user id>&prefilled_email=<email>` via
  `paymentsService.buildCheckoutUrl()` (`src/services/payments/`) so the webhook
  can correlate the payment back to the user.
- **Source of truth**: `app/api/stripe/webhook/route.ts` (subscribed to
  `checkout.session.completed`, `invoice.payment_succeeded`,
  `invoice.payment_failed`, `customer.subscription.updated`,
  `customer.subscription.deleted`). Upserts `public.subscriptions` (one row per
  Stripe subscription, reuses Stripe's own status enum verbatim), appends an
  audit row to `public.payments` (idempotent on `stripe_event_id`), and mirrors
  status onto the user's `app_metadata` (`paid`, `subscription_status`) — UX
  signal only, never trusted server-side.
- **Revocation policy**: access is revoked on `customer.subscription.updated`
  transitioning to a non-active status (`past_due`/`unpaid`/`canceled`/etc.), not
  on the first `invoice.payment_failed` — Stripe's Smart Retries can recover a
  transient decline while the subscription still reads `active`, so acting on
  `subscription.updated` avoids over-eager revocation on a one-off card blip.
  This is a one-line change (`app/api/stripe/webhook/route.ts`) if a zero-grace
  policy is ever wanted instead.
- **Real enforcement is server-side, not client-side**: `app/api/try-on/route.ts`
  requires `Authorization: Bearer <access_token>`, verifies it via
  `getSupabaseAdminClient().auth.getUser(token)` (a live lookup, not local JWT
  decode), then re-reads the **live** `subscriptions` row for that user on every
  single request (401 unauthenticated, 402 not subscribed/lapsed). This is what
  actually blocks a lapsed subscriber — it doesn't depend on the client's token
  being expired or on session revocation having succeeded.
- **Client-side gating is UX only**: `RequireAuth` (`src/components/auth/`) has a
  `requirePaid` prop mirroring `requireAdmin`, redirecting to
  `/payment-required` when `AuthContext.isPaid` is false. `isPaid` is populated
  by calling `GET /api/me/subscription` (Bearer-token auth), never derived from
  client-held session state.
- **Forced logout on lapse**: the webhook best-effort deletes the user's
  `auth.sessions` rows (`src/lib/supabase/revokeSessions.ts`) — this is
  unverified/best-effort (supabase-js has no first-class "revoke all sessions
  for a user id" call) and wrapped in try/catch; if it silently no-ops, the
  server-side check above still blocks access on the next try-on call
  regardless. Lowering the Supabase Auth **access-token TTL** (dashboard
  setting, not code) tightens how fast the UI visibly reflects the logout.
- **Data is locked down**: `subscriptions` and `payments` (first real Postgres
  tables in this project, via one Supabase migration) have RLS **enabled with
  zero policies** for `anon`/`authenticated` — only the service-role client
  (`src/lib/supabase/serverAdmin.ts`, `SUPABASE_SERVICE_ROLE_KEY`) can read or
  write either table. `GET /api/me/subscription` is the *only* sanctioned path
  from the client to this data, returning just `{status, currentPeriodEnd}` for
  the `/payment-required` "why was I logged out" messaging — never a direct
  client-side Supabase query against these tables.
- **Stripe test mode** currently (account "boaz sandbox"). Switching to live is
  config-only: create a live Product/Price/Payment Link/webhook, swap the four
  env vars below, no code changes.
- New env vars (server-only unless noted): `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and
  `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL` (public). Same dual-registration rule as
  `TRYON_WEBHOOK_URL` — `.env.local` **and** Vercel (Production + Preview), fresh
  deploy required for Vercel changes to take effect.

## Placeholders this release (behind swappable service interfaces)
- **Products** — in-memory seed in `src/services/products` (resets on reload).
- DB persistence / payments / Vercel storage are future scope. Swap the single
  binding in each service's `index.ts` to change backends — no UI changes.

## MCP servers
- **Supabase** MCP server registered at project scope (`.mcp.json`, `--transport http`),
  project ref `clvsixocontdqxvyufsn` — likely the target for the "real DB" swap
  mentioned above. Needs per-session approval (`/mcp` in each new Claude Code
  session) before its tools are usable; a session started before the server was
  added won't see it until restarted.

## Conventions
- Money stored as **integer cents**; default currency **ILS ₪**. Format via `src/lib/format.ts`.
- All backend access goes through the service interfaces in `src/services/*` —
  that's the integration seam. Keep UI decoupled from data sources.

## Verify changes
- `npm run lint`, `npm run test` (Vitest), `npm run build`.
- App: `npm run dev` → http://localhost:3000. Try-on makes a **real** call to n8n.
