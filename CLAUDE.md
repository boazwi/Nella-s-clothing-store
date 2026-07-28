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
