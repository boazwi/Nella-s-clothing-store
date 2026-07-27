import { localProductService } from "./localProductService";
import type { ProductService } from "./types";

// Swap this single binding to change the product backend for the whole app.
export const productService: ProductService = localProductService;

export type { ProductService, NewProductInput } from "./types";
