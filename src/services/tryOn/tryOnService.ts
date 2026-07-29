import type { TryOnError, TryOnRequest, TryOnResult } from "@/types";
import { TRY_ON_CLIENT_TIMEOUT_MS } from "@/lib/constants";

function fail(error: TryOnError): never {
  throw error;
}

/**
 * Calls the internal /api/try-on proxy (which forwards to n8n) with the person
 * photo as `image1` and the garment image as `image2`, and returns the
 * generated image as an object URL. Throws a typed TryOnError on failure.
 */
export async function generate({
  personFile,
  garmentFile,
  accessToken,
}: TryOnRequest & { accessToken: string }): Promise<TryOnResult> {
  const form = new FormData();
  form.append("image1", personFile); // person
  form.append("image2", garmentFile); // garment

  let res: Response;
  try {
    res = await fetch("/api/try-on", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
      signal: AbortSignal.timeout(TRY_ON_CLIENT_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") fail({ kind: "timeout" });
    fail({ kind: "network" });
  }

  if (res.status === 504) fail({ kind: "timeout" });
  if (res.status === 402) fail({ kind: "payment-required" });
  if (!res.ok) fail({ kind: "server", status: res.status });

  const blob = await res.blob();
  if (!blob.type.startsWith("image/")) fail({ kind: "non-image" });

  return { blob, imageUrl: URL.createObjectURL(blob) };
}

export const tryOnService = { generate };
