import { describe, expect, it } from "vitest";
import { validateImageFile, productSchema, registerSchema, loginSchema } from "./validation";
import { MAX_IMAGE_BYTES } from "./constants";

function makeFile(type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], "test", { type });
}

describe("validateImageFile", () => {
  it("accepts a valid JPG within the size limit", () => {
    expect(validateImageFile(makeFile("image/jpeg", 1000))).toEqual({ ok: true });
  });

  it("accepts PNG and WebP", () => {
    expect(validateImageFile(makeFile("image/png", 1000)).ok).toBe(true);
    expect(validateImageFile(makeFile("image/webp", 1000)).ok).toBe(true);
  });

  it("rejects unsupported types", () => {
    const result = validateImageFile(makeFile("image/gif", 1000));
    expect(result.ok).toBe(false);
  });

  it("rejects files over the size limit", () => {
    const result = validateImageFile(makeFile("image/jpeg", MAX_IMAGE_BYTES + 1));
    expect(result.ok).toBe(false);
  });
});

describe("productSchema", () => {
  it("accepts a valid product", () => {
    const parsed = productSchema.safeParse({
      name: "Dress",
      description: "Nice",
      priceCents: 1000,
      currency: "ILS",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects negative prices", () => {
    const parsed = productSchema.safeParse({
      name: "Dress",
      description: "Nice",
      priceCents: -1,
      currency: "ILS",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("auth schemas", () => {
  it("registerSchema requires a full name", () => {
    expect(
      registerSchema.safeParse({ email: "a@b.com", password: "secret1" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        fullName: "Ada",
        email: "a@b.com",
        password: "secret1",
      }).success,
    ).toBe(true);
  });

  it("loginSchema does not require a full name", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "secret1" }).success,
    ).toBe(true);
  });

  it("rejects short passwords", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(
      false,
    );
  });
});
