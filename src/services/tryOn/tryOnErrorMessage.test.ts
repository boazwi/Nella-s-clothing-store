import { describe, expect, it } from "vitest";
import { tryOnErrorMessage } from "./index";
import type { TryOnError } from "@/types";

describe("tryOnErrorMessage", () => {
  it("returns the validation message directly", () => {
    const err: TryOnError = { kind: "validation", message: "Too big" };
    expect(tryOnErrorMessage(err)).toBe("Too big");
  });

  it("maps timeout errors", () => {
    expect(tryOnErrorMessage({ kind: "timeout" })).toMatch(/longer than expected/i);
  });

  it("maps network errors", () => {
    expect(tryOnErrorMessage({ kind: "network" })).toMatch(/offline/i);
  });

  it("maps server and non-image errors to a generic retry message", () => {
    expect(tryOnErrorMessage({ kind: "server", status: 502 })).toMatch(/try again/i);
    expect(tryOnErrorMessage({ kind: "non-image" })).toMatch(/try again/i);
  });

  it("maps payment-required errors", () => {
    expect(tryOnErrorMessage({ kind: "payment-required" })).toMatch(/subscription/i);
  });

  it("falls back for unknown errors", () => {
    expect(tryOnErrorMessage(new Error("boom"))).toMatch(/something went wrong/i);
  });
});
