# Project: Nella's Clothing Store (חנות הבגדים של נלה)

Frontend for a clothing e-commerce site whose signature feature is an **AI
virtual try-on**. Full detail lives in [PRD.md](PRD.md) (product) and
[SPEC.md](SPEC.md) (engineering). This file is the quick, durable summary of
decisions that are easy to forget.

## Stack
- **Next.js (App Router) + TypeScript (strict) + Tailwind CSS**
- React Query (server state), React Hook Form + Zod (forms), lucide-react (icons)
- Fonts: Playfair Display (headings) + Inter (body) via `next/font`
- Package manager: **npm**. Hosting target (future): Vercel.

## Virtual try-on — the core feature
- Client posts `multipart/form-data` to the **internal** route `app/api/try-on/route.ts`,
  which proxies to the n8n webhook. Never call the webhook directly from the browser.
- **Image mapping (confirmed):** `image1` = person photo, `image2` = garment.
- Webhook URL is the **server-only** env var `TRYON_WEBHOOK_URL` (no `NEXT_PUBLIC_`).
  Set in `.env.local` (gitignored). The proxy hides it and avoids CORS.
- Backend returns a **binary image**; the client renders it via an object URL.
- **Raster only:** the backend rejects **SVG**. The garment image is normalized to
  **PNG** on the client (canvas) before upload — see `imageUrlToPngFile` in
  `src/lib/image.ts`. Person photos must be JPG/PNG/WebP (validated, SVG excluded).

## Placeholders this release (behind swappable service interfaces)
- **Auth** — localStorage mock in `src/services/auth`. Any credentials work.
  Emails ending in `@admin.nella` get the **admin** role (to reach `/admin`).
- **Products** — in-memory seed in `src/services/products` (resets on reload).
- Real auth / DB / payments / Vercel storage are future scope. Swap the single
  binding in each service's `index.ts` to change backends — no UI changes.

## Conventions
- Money stored as **integer cents**; default currency **ILS ₪**. Format via `src/lib/format.ts`.
- All backend access goes through the service interfaces in `src/services/*` —
  that's the integration seam. Keep UI decoupled from data sources.

## Verify changes
- `npm run lint`, `npm run test` (Vitest), `npm run build`.
- App: `npm run dev` → http://localhost:3000. Try-on makes a **real** call to n8n.
