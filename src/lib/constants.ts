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

// Vercel serverless functions cap request bodies at 4.5 MB. Both images share
// that one request, so any file above this threshold is compressed client-side
// before upload, leaving headroom for the second image and multipart overhead.
export const UPLOAD_COMPRESSION_THRESHOLD_BYTES = 3 * 1024 * 1024; // 3 MB
export const MAX_UPLOAD_DIMENSION = 1600; // px, longest side after compression
export const UPLOAD_JPEG_QUALITY = 0.82;
