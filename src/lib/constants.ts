import type { Currency } from "@/types";

export const ACCEPTED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const RECOMMENDED_MIN_DIMENSION = 512; // px, shorter side (warn only)

export const DEFAULT_CURRENCY: Currency = "ILS";

// Client-side timeout for the try-on request (ms). The server proxy uses a
// slightly shorter upstream timeout so it can return a clean 502.
export const TRY_ON_CLIENT_TIMEOUT_MS = 120_000;
export const TRY_ON_UPSTREAM_TIMEOUT_MS = 115_000;
