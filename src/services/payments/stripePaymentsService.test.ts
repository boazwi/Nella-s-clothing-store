import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stripePaymentsService } from "./stripePaymentsService";

describe("stripePaymentsService.buildCheckoutUrl", () => {
  const original = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL = "https://buy.stripe.com/test_abc123";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL = original;
  });

  it("appends client_reference_id and prefilled_email", () => {
    const url = stripePaymentsService.buildCheckoutUrl("user-123", "shopper@example.com");
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://buy.stripe.com/test_abc123");
    expect(parsed.searchParams.get("client_reference_id")).toBe("user-123");
    expect(parsed.searchParams.get("prefilled_email")).toBe("shopper@example.com");
  });

  it("throws a clear error when the payment link env var is missing", () => {
    delete process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;
    expect(() => stripePaymentsService.buildCheckoutUrl("user-123", "a@b.com")).toThrow(
      /not configured/i,
    );
  });
});
