import type { Product } from "@/types";

export type NewProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

/**
 * The single integration seam for product data (SPEC §4.2 / §4.4).
 * This release ships a local/in-memory implementation seeded with sample
 * garments; a real DB or n8n-backed implementation can replace it later.
 */
export interface ProductService {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: NewProductInput): Promise<Product>;
  updateProduct(id: string, patch: Partial<NewProductInput>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  uploadProductImage(file: File): Promise<string>; // returns an imageUrl
}
