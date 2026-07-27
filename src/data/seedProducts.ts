import type { Product } from "@/types";

// Sample catalog so the app is demoable from first run. Prices are ILS in
// integer cents (e.g. 24900 = ₪249.00). Images are local SVG placeholders.
export const seedProducts: Product[] = [
  {
    id: "prod-round-glasses",
    name: "Round Reading Glasses",
    description:
      "Retro-inspired round frames in deep navy. Lightweight, timeless, and easy to wear all day.",
    priceCents: 18000,
    currency: "ILS",
    imageUrl: "/products/20260727_133112.jpg",
    createdAt: "2026-07-07T09:00:00.000Z",
    updatedAt: "2026-07-07T09:00:00.000Z",
  },
  {
    id: "prod-linen-dress",
    name: "Linen Summer Dress",
    description:
      "A breezy midi dress in soft natural linen. Relaxed fit with a tie waist — effortless for warm days.",
    priceCents: 24900,
    currency: "ILS",
    imageUrl: "/products/linen-dress.svg",
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "prod-denim-jacket",
    name: "Classic Denim Jacket",
    description:
      "A timeless mid-wash denim jacket with a tailored silhouette. Layers over everything.",
    priceCents: 31900,
    currency: "ILS",
    imageUrl: "/products/denim-jacket.svg",
    createdAt: "2026-07-02T09:00:00.000Z",
    updatedAt: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "prod-knit-sweater",
    name: "Cozy Knit Sweater",
    description:
      "A chunky ribbed knit in warm oatmeal. Soft, roomy, and made for cooler evenings.",
    priceCents: 27500,
    currency: "ILS",
    imageUrl: "/products/knit-sweater.svg",
    createdAt: "2026-07-03T09:00:00.000Z",
    updatedAt: "2026-07-03T09:00:00.000Z",
  },
  {
    id: "prod-silk-blouse",
    name: "Silk Button Blouse",
    description:
      "An elegant blouse in fluid silk with a subtle sheen. Dress it up or keep it casual.",
    priceCents: 29900,
    currency: "ILS",
    imageUrl: "/products/silk-blouse.svg",
    createdAt: "2026-07-04T09:00:00.000Z",
    updatedAt: "2026-07-04T09:00:00.000Z",
  },
  {
    id: "prod-tailored-trousers",
    name: "Tailored Wide Trousers",
    description:
      "High-waisted wide-leg trousers with a clean drape. Polished comfort for any occasion.",
    priceCents: 26500,
    currency: "ILS",
    imageUrl: "/products/tailored-trousers.svg",
    createdAt: "2026-07-05T09:00:00.000Z",
    updatedAt: "2026-07-05T09:00:00.000Z",
  },
  {
    id: "prod-trench-coat",
    name: "Classic Trench Coat",
    description:
      "A double-breasted trench in a warm sand tone. The finishing layer for every wardrobe.",
    priceCents: 45900,
    currency: "ILS",
    imageUrl: "/products/trench-coat.svg",
    createdAt: "2026-07-06T09:00:00.000Z",
    updatedAt: "2026-07-06T09:00:00.000Z",
  },
];
