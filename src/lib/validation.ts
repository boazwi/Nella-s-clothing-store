import { z } from "zod";
import { ACCEPTED_IMAGE_MIME, MAX_IMAGE_BYTES } from "./constants";

export type ImageValidation = { ok: true } | { ok: false; message: string };

/** Validate an uploaded image file by MIME type and size (SPEC §8). */
export function validateImageFile(file: File): ImageValidation {
  if (!ACCEPTED_IMAGE_MIME.includes(file.type as (typeof ACCEPTED_IMAGE_MIME)[number])) {
    return { ok: false, message: "Please use a JPG, PNG, or WebP image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "Image must be smaller than 10 MB." };
  }
  return { ok: true };
}

// ---- Form schemas ---------------------------------------------------------

export const productSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  priceCents: z.number().int().nonnegative("Price cannot be negative."),
  currency: z.enum(["ILS", "USD", "EUR"]),
});
export type ProductFormValues = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema;
export type RegisterFormValues = z.infer<typeof registerSchema>;
