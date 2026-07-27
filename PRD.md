# Product Requirements Document (PRD)
## Nella's Clothing Store (חנות הבגדים של נלה) — Frontend

**Version:** 1.0
**Owner:** Product Management
**Scope:** Frontend only (backend virtual try-on is live in n8n)
**Last updated:** 2026-07-25

---

## 1. Overview & Goals

### 1.1 Summary
Nella's Clothing Store is an e-commerce clothing website whose signature feature is an **AI virtual try-on**: a registered customer uploads a photo of themselves, selects a garment from the catalog, and the site returns a generated image of that customer wearing the item. This PRD specifies the **frontend** application. The image-generation backend already exists as an n8n workflow exposed via a webhook.

### 1.2 Goals
- Deliver a clean, modern, mobile-first fashion storefront that showcases clothing items.
- Provide a frictionless **virtual try-on** flow that reliably calls the n8n backend and displays the returned image.
- Provide an **admin** surface for managing (add / upload / update) product images.
- Architect auth and product-data layers behind clean interfaces so real backends can be added later with minimal rework.

### 1.3 Non-Goals (this release)
- Real payment / checkout (future scope).
- Production auth provider and product database (future scope — placeholders now).
- Order management, shipping, inventory, reviews.

### 1.4 Success Criteria
A frontend developer can build the app from this document; a user can register (placeholder), browse items, run a try-on, and see the merged result; an admin can add/update product images.

---

## 2. Target Users & Personas

| Persona | Description | Primary Needs |
|---|---|---|
| **Maya, the Shopper** | 25–45, fashion-curious, mobile-first, unsure how clothes will look on her. | Browse easily; try items on her own photo; trust the result; fast experience. |
| **Nella, the Store Manager (Admin)** | Owns the store, non-technical. | Add new products, upload/replace product images, keep catalog current with minimal friction. |
| **Guest Visitor** | Not registered. | Browse catalog; be prompted to register before try-on. |

---

## 3. User Stories

**Shopper**
- As a shopper, I can browse a catalog of clothing items with image, name, price, and description.
- As a shopper, I can register and log in so I can use try-on. *(placeholder auth this release)*
- As a shopper, I can upload a photo of myself.
- As a shopper, I can select a garment and trigger a virtual try-on.
- As a shopper, I see a clear loading state while the image is generated.
- As a shopper, I see the generated "me wearing the item" image, and can download it or try another item.
- As a shopper, I get a clear, friendly error if generation fails, with a retry option.

**Admin**
- As an admin, I can add a new product (image + name + price + description).
- As an admin, I can upload or replace the image of an existing product.
- As an admin, I can edit or remove a product. *(persistence is placeholder this release)*

**Guest**
- As a guest, I can browse but am prompted to register when I attempt try-on.

---

## 4. Functional Requirements

### 4.1 Registration & Authentication *(placeholder implementation)*
- **FR-1.1** Provide Sign-Up and Login screens (email + password fields, validation, error messaging).
- **FR-1.2** Provide session handling: a signed-in state persisted across refresh (e.g., context + localStorage) and a logout action.
- **FR-1.3** Gate the try-on flow behind an authenticated state; redirect guests to registration.
- **FR-1.4** **Architecture requirement:** implement all auth calls behind a single `AuthProvider` / `authService` interface (`signUp`, `login`, `logout`, `getSession`). This release uses a local mock; a real provider (e.g., Supabase/Clerk) can be dropped in later without changing UI code.

### 4.2 Product Catalog
- **FR-2.1** Display a responsive grid of product cards: product image, name, price, short description.
- **FR-2.2** Product detail view: larger image, full description, price, and a **"Try it on"** call-to-action.
- **FR-2.3** Loading skeletons while catalog data loads; empty-state UI when no products exist.
- **FR-2.4** **Architecture requirement:** read products via a `productService` interface (`listProducts`, `getProduct`). This release backs it with a local/static source; a DB or n8n endpoint can replace it later.

### 4.3 Virtual Try-On (core feature)
- **FR-3.1** On the try-on screen, the authenticated user uploads a photo of themselves (**the "person" image**).
- **FR-3.2** The user selects one garment (**the "garment" image**) — either pre-selected from the product they came from, or chosen here.
- **FR-3.3** On submit, the frontend builds a `multipart/form-data` POST with two files:
  - `image1` = **the person's photo** (customer upload)
  - `image2` = **the garment image** (selected product)
- **FR-3.4** POST to the production webhook: `https://boazwi.app.n8n.cloud/webhook/bae811b4-033e-45f8-b7b0-026876b09bc8`
- **FR-3.5** The response is a **binary image file**; render it (via object URL / blob) as the "customer wearing the item" result.
- **FR-3.6** Provide a visible **loading/progress state** during generation (generation can take many seconds).
- **FR-3.7** After success: show the result with **Download** and **Try another item** actions.
- **FR-3.8** Handle timeouts, non-image responses, and network/server errors gracefully (see §9).
- **FR-3.9** Client-side image validation before upload (see §7.3).

### 4.4 Admin — Product Management
- **FR-4.1** An admin area (route-guarded) listing all products.
- **FR-4.2** Add product: upload image + enter name, price, description.
- **FR-4.3** Update product: replace image and/or edit fields.
- **FR-4.4** Delete product.
- **FR-4.5** Client-side validation of product image (format/size) and required fields.
- **FR-4.6** **Architecture requirement:** all writes go through `productService` (`createProduct`, `updateProduct`, `deleteProduct`, `uploadProductImage`), backed by a placeholder store now; swap for real persistence later.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- First contentful paint < 2s on 4G; catalog grid interactive < 3s.
- Use Next.js image optimization (`next/image`) and lazy-loading for product images.
- Try-on request UI must remain responsive (non-blocking) while awaiting the webhook.

### 5.2 Security
- No secrets, API keys, or tokens in client code or the repo. Any future keys go in **environment variables** (`.env.local`, Vercel env vars).
- The webhook URL is stored in an env var (e.g., `NEXT_PUBLIC_TRYON_WEBHOOK_URL`), not hardcoded.
- Validate and sanitize all user inputs; restrict uploads to allowed image types/sizes.
- Serve over HTTPS only.

### 5.3 Accessibility (WCAG 2.1 AA)
- Semantic HTML, keyboard-navigable flows, visible focus states.
- All images have meaningful `alt` text; upload controls have labels.
- Color contrast ≥ 4.5:1 for text; error states not conveyed by color alone.

### 5.4 Responsiveness
- Mobile-first. Breakpoints: mobile (base), tablet (`md`), desktop (`lg`).
- Catalog grid: 1 col mobile, 2–3 tablet, 3–4 desktop.
- Touch-friendly targets (≥ 44px).

### 5.5 Browser Support
- Latest 2 versions of Chrome, Safari, Firefox, Edge; iOS Safari and Android Chrome.

---

## 6. Design & UX Guidelines

### 6.1 Brand Tone
Elegant, modern boutique — warm, minimal, confident. The photography (product + try-on results) is the hero; UI stays quiet around it.

### 6.2 Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary (brand) | Deep plum / aubergine | `#4A2C40` |
| Accent | Warm rosé / blush | `#D9A5A0` |
| Background | Soft ivory | `#FAF7F2` |
| Surface / cards | White | `#FFFFFF` |
| Text primary | Charcoal | `#2B2B2B` |
| Text secondary | Warm grey | `#7A7A7A` |
| Success | Sage | `#6B8E6B` |
| Error | Muted red | `#C0554E` |

Support a light theme as default; keep tokens centralized so a dark theme can be added later.

### 6.3 Typography
- **Headings:** a refined serif (e.g., *Playfair Display*) for a fashion feel.
- **Body / UI:** a clean sans-serif (e.g., *Inter*).
- Scale: H1 40–48px, H2 28–32px, body 16px, small 14px. Generous line-height (1.5 body).

### 6.4 Layout & Key Screens
- **Global:** top nav (logo "Nella's Clothing Store", catalog, login/account, admin entry when admin); minimal footer.
- **Home / Catalog:** hero banner + responsive product grid.
- **Product Detail:** two-column on desktop (image left, details + "Try it on" right); stacked on mobile.
- **Try-On Screen:** step layout — (1) upload your photo, (2) confirm/select garment, (3) generate → result with Download / Try another.
- **Result:** large result image, prominent Download button, subtle "regenerate / try another item."
- **Admin:** table/list of products + add/edit form modal or page with image upload preview.

### 6.5 Style Details
- Soft rounded corners (8–12px), gentle shadows, ample whitespace.
- Micro-interactions: hover elevation on cards, smooth loading skeletons, animated progress indicator during generation.

---

## 7. Backend / API Integration Details

### 7.1 Try-On Webhook Contract
- **Endpoint:** `POST https://boazwi.app.n8n.cloud/webhook/bae811b4-033e-45f8-b7b0-026876b09bc8`
  (referenced via env var `NEXT_PUBLIC_TRYON_WEBHOOK_URL`)
- **Request:** `Content-Type: multipart/form-data` with exactly two file fields:

| Field | Content | Notes |
|---|---|---|
| `image1` | **Person photo** (customer's uploaded image) | Confirmed mapping |
| `image2` | **Garment image** (selected product) | Confirmed mapping |

- **Response:** a **binary image file** (e.g., `image/png` or `image/jpeg`). The frontend reads it as a `Blob`, creates an object URL, and renders it in an `<img>`.
- **Method:** `fetch(url, { method: 'POST', body: formData })` then `await res.blob()`.

**Reference implementation sketch:**
```ts
const form = new FormData();
form.append('image1', personFile);   // person
form.append('image2', garmentFile);  // garment

const res = await fetch(process.env.NEXT_PUBLIC_TRYON_WEBHOOK_URL!, {
  method: 'POST',
  body: form,
  signal: AbortSignal.timeout(120_000), // see timeout handling §9
});

if (!res.ok) throw new TryOnError(res.status);
const blob = await res.blob();
if (!blob.type.startsWith('image/')) throw new TryOnError('non-image-response');
const resultUrl = URL.createObjectURL(blob); // render, and revoke on cleanup
```

### 7.2 Garment Image Sourcing
The garment (`image2`) comes from the selected product's image. The frontend loads that product image and **rasterizes it to a PNG** `File` (via a canvas) before appending it to the form, so both fields are true raster file uploads. **The try-on backend cannot process vector images (SVG)** — this normalization guarantees a valid raster garment regardless of the product image's source format.

### 7.3 Client-Side Image Validation
- **Accepted formats:** JPG/JPEG, PNG, WebP. **Not SVG** — vector images are not valid try-on inputs.
- **Max file size:** 10 MB per image (configurable constant).
- **Min dimensions:** recommend ≥ 512px on the shorter side (warn if smaller).
- Reject unsupported types with a clear inline message; show a preview thumbnail after selection.

### 7.4 Future Endpoints (placeholders)
Auth and product persistence services will expose their own endpoints later; keep `authService` and `productService` interfaces as the single integration seam.

---

## 8. Admin Features
- Route-guarded `/admin` area (admin-only once real auth exists; placeholder role flag now).
- Product list with thumbnails and quick edit.
- Add / edit product form: image upload (with preview + validation), name, price, description.
- Replace-image action on existing products.
- Delete with confirmation.
- All operations via `productService` (placeholder store now, real backend later).

---

## 9. Error Handling & Edge Cases

| Case | Handling |
|---|---|
| No file selected / wrong type / too large | Inline validation message; block submit. |
| Try-on request timeout | Abort after ~120s; show "This is taking longer than expected" + Retry. |
| Webhook returns non-2xx | Friendly error ("We couldn't create your try-on right now") + Retry; log status. |
| Response is not an image | Treat as failure; show generic error + Retry. |
| Network offline | Detect and show offline message. |
| Slow generation | Persistent animated progress indicator; disable duplicate submits. |
| Unauthenticated user hits try-on | Redirect to registration/login. |
| Empty catalog | Friendly empty state (admin: prompt to add first product). |
| Large uploads on mobile | Optional client-side downscale before upload to reduce payload. |
| Memory leaks from object URLs | `URL.revokeObjectURL` on unmount / new generation. |

---

## 10. Future Scope (planned, not built now)
- **Authentication:** real provider (e.g., Supabase/Clerk/Auth) behind the existing `authService` interface.
- **Product persistence:** real database / storage backing `productService` (managed DB, Vercel storage, or n8n endpoints).
- **Payments / Checkout:** cart, payment provider integration, order flow.
- **Hosting & Storage on Vercel:** deploy the Next.js app to Vercel; use Vercel env vars for the webhook URL and future secrets; Vercel storage for product and result images.
- **Enhancements:** save/share try-on results, wishlists, multi-item outfits, order history.

---

## 11. Success Metrics
- **Try-on completion rate:** % of started try-ons that render a result.
- **Try-on success/error ratio** and median generation time.
- **Registration conversion:** guests → registered.
- **Engagement:** try-ons per user; result downloads/shares.
- **Admin efficiency:** time to add/update a product; catalog freshness.
- **Performance:** Core Web Vitals (LCP, CLS, INP) within Google "good" thresholds.

---

## 12. Open Questions & Assumptions

**Assumptions**
- Webhook mapping confirmed: `image1` = person, `image2` = garment.
- Tech stack: **Next.js (App Router) + React + TypeScript + Tailwind CSS**.
- Auth and product persistence are placeholders this release, built behind swappable service interfaces.
- The webhook accepts `multipart/form-data` and returns a raw binary image.
- **Confirmed:** the webhook requires **raster** input images (JPG/PNG/WebP) and rejects SVG. The frontend normalizes the garment image to PNG before sending (§7.2).

**Open Questions**
1. Does the webhook require any auth header/token, or is it open? (Assumed open for now.)
2. Exact output format/dimensions of the returned image? (Assumed standard JPG/PNG.)
3. Are there rate limits or a typical/max generation time to design the timeout around?
4. Does n8n enforce CORS for browser-origin POSTs, or is a same-origin proxy (Next.js API route) needed? *(Recommendation: route the call through a Next.js server route to avoid CORS/exposure issues.)*
5. Preferred future auth and product-storage providers (to finalize the service interfaces)?
