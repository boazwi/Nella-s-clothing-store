import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats ILS cents into shekels", () => {
    const formatted = formatPrice(24900, "ILS");
    // Contains the shekel sign and the amount 249
    expect(formatted).toContain("249");
    expect(formatted).toMatch(/₪|ILS/);
  });

  it("formats USD cents into dollars", () => {
    expect(formatPrice(1050, "USD")).toContain("10.50");
  });

  it("handles zero", () => {
    expect(formatPrice(0, "ILS")).toContain("0");
  });
});
