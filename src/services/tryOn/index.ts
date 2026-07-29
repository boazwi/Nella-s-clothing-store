import type { TryOnError } from "@/types";

export { tryOnService, generate } from "./tryOnService";

/** Map a typed TryOnError to a friendly, user-facing message (SPEC §10). */
export function tryOnErrorMessage(error: unknown): string {
  const e = error as TryOnError | undefined;
  switch (e?.kind) {
    case "validation":
      return e.message;
    case "timeout":
      return "This is taking longer than expected. Please try again.";
    case "server":
      return "We couldn't create your try-on right now. Please try again.";
    case "non-image":
      return "We couldn't create your try-on right now. Please try again.";
    case "network":
      return "You appear to be offline. Check your connection and try again.";
    case "payment-required":
      return "An active subscription is required to use try-on.";
    default:
      return "Something went wrong. Please try again.";
  }
}
