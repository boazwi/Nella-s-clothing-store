import type { Product } from "@/types";
import { seedProducts } from "@/data/seedProducts";
import type { NewProductInput, ProductService } from "./types";

// In-memory store seeded with sample products. State lives for the lifetime of
// the running client (resets on full reload) — a placeholder until real
// persistence is wired behind this same interface.
let products: Product[] = seedProducts.map((p) => ({ ...p }));

function nowIso(): string {
  return new Date().toISOString();
}

export const localProductService: ProductService = {
  async listProducts() {
    return products.map((p) => ({ ...p }));
  },

  async getProduct(id) {
    const found = products.find((p) => p.id === id);
    return found ? { ...found } : null;
  },

  async createProduct(input: NewProductInput) {
    const product: Product = {
      ...input,
      id: `prod-${crypto.randomUUID()}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    products = [product, ...products];
    return { ...product };
  },

  async updateProduct(id, patch) {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Product not found: ${id}`);
    const updated: Product = {
      ...products[index],
      ...patch,
      updatedAt: nowIso(),
    };
    products[index] = updated;
    return { ...updated };
  },

  async deleteProduct(id) {
    products = products.filter((p) => p.id !== id);
  },

  async uploadProductImage(file: File) {
    // Placeholder: return an object URL for the uploaded file. Real storage
    // (Vercel Blob / DB) would upload and return a persistent URL here.
    return URL.createObjectURL(file);
  },
};
