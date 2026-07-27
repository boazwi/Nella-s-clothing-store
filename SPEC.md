# Technical Specification
## Nella's Clothing Store (חנות הבגדים של נלה) — Frontend

**Version:** 1.0
**Status:** Draft for implementation
**Based on:** [PRD.md](PRD.md)
**Last updated:** 2026-07-25

> This document is the engineering translation of the PRD. It defines the architecture, project structure, data models, service contracts, components, routing, and state so a developer can build the app directly.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR/SSG, image optimization, API routes, Vercel-native. |
| Language | **TypeScript (strict)** | `strict: true` in `tsconfig`. |
| UI | **React 18** | Server + Client Components. |
| Styling | **Tailwind CSS** | Design tokens in `tailwind.config.ts`. |
| State (client) | **React Context + hooks** | `AuthContext`; local component state for flows. |
| Server state | **TanStack Query (React Query)** | Caching for catalog + async try-on mutation. |
| Forms/validation | **React Hook Form + Zod** | Zod schemas shared for validation. |
| Icons | **lucide-react** | Lightweight. |
| Fonts | **next/font** (Playfair Display + Inter) | Self-hosted, no layout shift. |
| Testing | **Vitest + React Testing Library**; **Playwright** (e2e) | |
| Lint/format | **ESLint + Prettier** | |
| Hosting (future) | **Vercel** | Env vars for webhook + secrets. |

---

## 2. Project Structure

```
fashion-magic/
├─ app/
│  ├─ layout.tsx                 # Root layout: fonts, providers, nav/footer
│  ├─ page.tsx                   # Home / catalog
│  ├─ globals.css
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  ├─ products/
│  │  └─ [id]/page.tsx           # Product detail
│  ├─ try-on/
│  │  └─ page.tsx                # Virtual try-on flow (auth-gated)
│  ├─ admin/
│  │  ├─ layout.tsx              # Admin route guard
│  │  ├─ page.tsx                # Product list
│  │  └─ products/
│  │     ├─ new/page.tsx
│  │     └─ [id]/edit/page.tsx
│  └─ api/
│     └─ try-on/route.ts         # Server proxy to n8n webhook (CORS + URL hiding)
├─ src/
│  ├─ components/
│  │  ├─ ui/                     # Button, Input, Card, Modal, Spinner, Skeleton…
│  │  ├─ layout/                 # Navbar, Footer
│  │  ├─ product/                # ProductCard, ProductGrid, ProductDetail
│  │  ├─ try-on/                 # ImageUploader, GarmentPicker, ResultView, ProgressState
│  │  └─ admin/                  # ProductForm, ProductTable
│  ├─ services/
│  │  ├─ auth/                   # authService interface + mock impl
│  │  ├─ products/               # productService interface + local impl
│  │  └─ tryOn/                  # tryOnService (calls /api/try-on)
│  ├─ hooks/                     # useAuth, useProducts, useTryOn
│  ├─ context/                   # AuthContext, providers
│  ├─ lib/                       # constants, validation (zod), image utils, http
│  ├─ types/                     # shared TS types
│  └─ data/                      # seed/mock products (placeholder)
├─ public/                       # static assets, placeholder product images
├─ .env.local.example
├─ tailwind.config.ts
├─ tsconfig.json
└─ package.json
```

---

## 3. Data Models & Types

```ts
// src/types/index.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;        // store money in integer cents
  currency: 'ILS' | 'USD' | 'EUR';
  imageUrl: string;          // catalog/garment image
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
}

export interface User {
  id: string;
  email: string;
  role: 'shopper' | 'admin';
}

export interface Session {
  user: User;
  token?: string;            // reserved for real auth
}

// Try-on
export interface TryOnRequest {
  personFile: File;          // -> image1
  garmentFile: File;         // -> image2
}

export type TryOnStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

export interface TryOnResult {
  imageUrl: string;          // object URL of returned blob
  blob: Blob;
}

export type TryOnError =
  | { kind: 'validation'; message: string }
  | { kind: 'timeout' }
  | { kind: 'server'; status: number }
  | { kind: 'non-image' }
  | { kind: 'network' };
```

---

## 4. Service Interfaces (the integration seam)

All backend interaction goes through these interfaces so mock/placeholder implementations can be swapped for real ones (auth provider, DB, n8n) with **no UI changes**.

### 4.1 authService *(placeholder: localStorage mock)*
```ts
export interface AuthService {
  signUp(email: string, password: string): Promise<Session>;
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
}
```
- Mock stores a fake session in `localStorage`; any password accepted (dev only).
- Real impl (future): Supabase/Clerk adapter behind the same interface.

### 4.2 productService *(placeholder: local/seed store)*
```ts
export interface ProductService {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(id: string, patch: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  uploadProductImage(file: File): Promise<string>; // returns imageUrl
}
```
- Placeholder: seed array in `src/data/`, mutations kept in memory/localStorage; `uploadProductImage` returns an object URL / data URL for now.
- Real impl (future): DB + Vercel/object storage, or n8n endpoints.

### 4.3 tryOnService *(real — calls the n8n webhook via server proxy)*
```ts
export interface TryOnService {
  generate(req: TryOnRequest): Promise<TryOnResult>;
}
```

---

## 5. Try-On Integration (core)

### 5.1 Flow
1. User uploads their photo → validated → `personFile` (**image1**).
2. Garment resolved from selected product image → fetched as `File` → `garmentFile` (**image2**).
3. `tryOnService.generate()` POSTs `multipart/form-data` to the **internal** route `/api/try-on`.
4. The Next.js **server route** forwards the request to the n8n webhook (hides URL, avoids browser CORS).
5. n8n returns a **binary image**; server streams it back; client wraps it in a `Blob` → object URL → renders.

### 5.2 Server proxy — `app/api/try-on/route.ts`
```ts
export const runtime = 'nodejs';
export const maxDuration = 120; // seconds (Vercel)

export async function POST(req: Request) {
  const incoming = await req.formData();
  const image1 = incoming.get('image1'); // person
  const image2 = incoming.get('image2'); // garment
  if (!(image1 instanceof File) || !(image2 instanceof File)) {
    return new Response('Missing images', { status: 400 });
  }

  const out = new FormData();
  out.append('image1', image1);
  out.append('image2', image2);

  const res = await fetch(process.env.TRYON_WEBHOOK_URL!, {
    method: 'POST',
    body: out,
    signal: AbortSignal.timeout(115_000),
  });

  if (!res.ok) return new Response('Upstream error', { status: 502 });

  const contentType = res.headers.get('content-type') ?? 'image/png';
  if (!contentType.startsWith('image/')) {
    return new Response('Non-image response', { status: 502 });
  }
  return new Response(res.body, { status: 200, headers: { 'content-type': contentType } });
}
```

### 5.3 Client — `tryOnService.generate`
```ts
export async function generate({ personFile, garmentFile }: TryOnRequest): Promise<TryOnResult> {
  const form = new FormData();
  form.append('image1', personFile);   // person
  form.append('image2', garmentFile);  // garment

  const res = await fetch('/api/try-on', {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw { kind: 'server', status: res.status } as TryOnError;

  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw { kind: 'non-image' } as TryOnError;

  return { blob, imageUrl: URL.createObjectURL(blob) };
}
```
> **Env var note:** the raw webhook URL lives in `TRYON_WEBHOOK_URL` (server-only, **not** `NEXT_PUBLIC_`) so it isn't exposed to the browser. This supersedes the PRD's client-var suggestion now that a proxy is used.

### 5.4 Garment file resolution
```ts
async function urlToFile(url: string, name: string): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type });
}
```

---

## 6. Routing & Access Control

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Home + catalog grid |
| `/products/[id]` | Public | Product detail + "Try it on" CTA |
| `/register`, `/login` | Public | Placeholder auth |
| `/try-on` | Authenticated | Upload photo, pick garment, generate, result |
| `/admin` | Admin role | Product list |
| `/admin/products/new` | Admin role | Add product |
| `/admin/products/[id]/edit` | Admin role | Edit/replace product |
| `/api/try-on` | Internal | Server proxy to n8n |

- **Auth gate:** `/try-on` checks session client-side; unauthenticated → redirect to `/login?next=/try-on`.
- **Admin gate:** `app/admin/layout.tsx` checks `session.user.role === 'admin'`; else redirect home. (Placeholder role flag now; enforced server-side once real auth exists.)

---

## 7. Components

### 7.1 UI primitives (`components/ui`)
`Button`, `Input`, `Textarea`, `Card`, `Modal`, `Spinner`, `Skeleton`, `Toast/Alert`, `FileDropzone`.

### 7.2 Feature components
| Component | Responsibility |
|---|---|
| `Navbar` | Logo, catalog link, account/login, admin entry (role-based) |
| `Footer` | Minimal brand footer |
| `ProductGrid` / `ProductCard` | Responsive catalog; image, name, price, description |
| `ProductDetail` | Large image, details, "Try it on" CTA |
| `ImageUploader` | Person-photo upload: dropzone, preview, validation |
| `GarmentPicker` | Shows selected garment; allows switching product |
| `ProgressState` | Animated indicator during generation |
| `ResultView` | Renders result image; Download + "Try another" actions |
| `ProductForm` | Admin add/edit: fields + image upload preview + validation |
| `ProductTable` | Admin list with edit/delete |

### 7.3 Try-on screen state machine
`idle → validating → submitting → (success | error)`; `error`/`success` can return to `idle` (retry / try another). Disable submit while `submitting`; revoke previous object URL before creating a new one and on unmount.

---

## 8. Validation Rules (Zod, `lib/validation.ts`)

```ts
export const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateImageFile(file: File): { ok: true } | { ok: false; message: string } {
  if (!IMAGE_MIME.includes(file.type as any)) return { ok: false, message: 'Use JPG, PNG, or WebP.' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: 'Image must be under 10 MB.' };
  return { ok: true };
}

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  currency: z.enum(['ILS', 'USD', 'EUR']),
});
```
- Recommend (warn, don't block) ≥ 512px shorter side; optional client-side downscale before upload for large mobile photos.

---

## 9. Design Tokens (`tailwind.config.ts`)

```ts
theme: {
  extend: {
    colors: {
      brand:      '#4A2C40', // deep plum
      accent:     '#D9A5A0', // blush
      background: '#FAF7F2', // ivory
      surface:    '#FFFFFF',
      ink:        '#2B2B2B', // text primary
      muted:      '#7A7A7A', // text secondary
      success:    '#6B8E6B',
      danger:     '#C0554E',
    },
    fontFamily: {
      serif: ['var(--font-playfair)'],
      sans:  ['var(--font-inter)'],
    },
    borderRadius: { card: '12px' },
  },
}
```
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- Fonts wired via `next/font` in `app/layout.tsx` (`--font-playfair`, `--font-inter`).

---

## 10. Error Handling (mapping to UX)

| `TryOnError.kind` | UI message | Action |
|---|---|---|
| `validation` | Inline field message | Block submit |
| `timeout` | "This is taking longer than expected." | Retry |
| `server` | "We couldn't create your try-on right now." | Retry; log status |
| `non-image` | Generic failure | Retry |
| `network` | "You appear to be offline." | Retry when back online |

- Global `Toast/Alert` for transient errors; inline messages for form/field errors.
- Never expose upstream/internal details to the user.

---

## 11. Environment Variables

`.env.local.example`:
```
# Server-only (NOT exposed to browser) — used by app/api/try-on
TRYON_WEBHOOK_URL=https://boazwi.app.n8n.cloud/webhook/bae811b4-033e-45f8-b7b0-026876b09bc8
```
- No secrets committed. On Vercel, set the same variable in project env settings.

---

## 12. Build, Test, Deploy

- **Scripts:** `dev`, `build`, `start`, `lint`, `test`, `test:e2e`.
- **Unit tests:** validation utils, service mocks, try-on state machine, `urlToFile`.
- **Component tests:** `ImageUploader` (accept/reject files), `ResultView` (renders/downloads), `ProductForm` (validation).
- **E2E (Playwright):** register → browse → open product → try-on happy path (webhook mocked) → result; admin add/edit product.
- **Deploy (future):** Vercel; set `TRYON_WEBHOOK_URL`; verify `maxDuration` covers generation time.

---

## 13. Implementation Phases (suggested)

1. **Scaffold:** Next.js + TS + Tailwind + fonts + tokens + layout/nav/footer.
2. **Catalog:** `productService` (mock) + `ProductGrid`/`ProductCard` + product detail.
3. **Auth (placeholder):** `authService` mock + `AuthContext` + login/register + route gates.
4. **Try-on:** `/api/try-on` proxy + `tryOnService` + uploader + garment picker + progress + result + errors.
5. **Admin:** admin guard + `ProductForm` + `ProductTable` + image upload.
6. **Hardening:** accessibility pass, responsive QA, tests, perf (Core Web Vitals).
7. **Future:** real auth, real product persistence, payments/checkout, Vercel storage.

---

## 14. Open Items (inherited from PRD §12)
- Webhook auth/token? (assumed open) · Output image format/size? · Rate limits / max generation time (tune timeout & `maxDuration`) · Final auth & storage providers.
