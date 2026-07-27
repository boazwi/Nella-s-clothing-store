import { NextResponse } from "next/server";
import { TRY_ON_UPSTREAM_TIMEOUT_MS } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 120; // seconds (Vercel function limit)

/**
 * Server-side proxy to the n8n virtual try-on webhook.
 *
 * Why a proxy instead of calling the webhook from the browser:
 *  - keeps the webhook URL server-only (TRYON_WEBHOOK_URL, no NEXT_PUBLIC_)
 *  - avoids browser CORS issues
 *  - centralizes the upstream timeout and error handling
 *
 * Contract: multipart/form-data with `image1` (person) and `image2` (garment).
 * Returns the upstream binary image on success.
 */
export async function POST(req: Request) {
  const webhookUrl = process.env.TRYON_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Try-on service is not configured." },
      { status: 500 },
    );
  }

  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const image1 = incoming.get("image1");
  const image2 = incoming.get("image2");
  if (!(image1 instanceof File) || !(image2 instanceof File)) {
    return NextResponse.json(
      { error: "Both image1 (person) and image2 (garment) are required." },
      { status: 400 },
    );
  }

  const outgoing = new FormData();
  outgoing.append("image1", image1, image1.name || "person");
  outgoing.append("image2", image2, image2.name || "garment");

  let upstream: Response;
  try {
    upstream = await fetch(webhookUrl, {
      method: "POST",
      body: outgoing,
      signal: AbortSignal.timeout(TRY_ON_UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json(
      { error: isTimeout ? "The try-on request timed out." : "Upstream request failed." },
      { status: isTimeout ? 504 : 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "The try-on service returned an error." },
      { status: 502 },
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "The try-on service did not return an image." },
      { status: 502 },
    );
  }

  // Stream the binary image back to the client unchanged.
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
    },
  });
}
