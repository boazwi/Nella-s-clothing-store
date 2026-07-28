// Shared domain types for Nella's Clothing Store (see SPEC §3).

export type Currency = "ILS" | "USD" | "EUR";

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number; // money stored as integer cents
  currency: Currency;
  imageUrl: string; // catalog / garment image
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type UserRole = "shopper" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Session {
  user: User;
  token?: string; // reserved for real auth
}

// ---- Try-on ---------------------------------------------------------------

export interface TryOnRequest {
  personFile: File; // -> image1
  garmentFile: File; // -> image2
}

export type TryOnStatus =
  | "idle"
  | "validating"
  | "submitting"
  | "success"
  | "error";

export interface TryOnResult {
  imageUrl: string; // object URL of the returned blob
  blob: Blob;
}

export type TryOnError =
  | { kind: "validation"; message: string }
  | { kind: "timeout" }
  | { kind: "server"; status: number }
  | { kind: "non-image" }
  | { kind: "network" };
