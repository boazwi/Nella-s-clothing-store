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

## Virtual try-on flow

1. The client posts `image1` (person) + `image2` (garment) as `multipart/form-data`
   to the internal route **`/api/try-on`**.
2. That server route forwards the request to `TRYON_WEBHOOK_URL` (hiding the URL
   and avoiding CORS), then streams the returned **binary image** back.
3. The client renders the image and offers a download.

## Placeholders (this release)

- **Auth** is a localStorage mock behind `src/services/auth`. Any credentials work.
  Emails ending in `@admin.nella` get the **admin** role (for reaching `/admin`).
- **Products** are seeded in memory behind `src/services/products` (resets on reload).

Both sit behind swappable service interfaces, so real backends can replace them
without UI changes. See future scope in the PRD.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; try-on webhook mocked) |
