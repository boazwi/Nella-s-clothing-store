/** Scale width/height down to fit within maxDimension, preserving aspect ratio. */
function fitWithin(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Load an image URL, draw it onto a canvas, and export a raster PNG File.
 *
 * The try-on backend (n8n) cannot process vector images (SVG), so the garment
 * image — whatever its source format — is normalized to PNG here before being
 * sent. A white background is painted first so transparent areas render
 * predictably. The result is capped to maxDimension on its longest side so
 * high-resolution product photos don't blow past the upload size budget.
 * Used to resolve the selected garment image (image2).
 */
export async function imageUrlToPngFile(
  url: string,
  filename: string,
  maxDimension = Infinity,
): Promise<File> {
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

  const { width, height } = fitWithin(
    img.naturalWidth || 1024,
    img.naturalHeight || 1024,
    maxDimension,
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to rasterize image."))),
      "image/png",
    );
  });

  return new File([blob], filename, { type: "image/png" });
}

/**
 * Downscale and re-encode a File as a compressed JPEG, capping its longest
 * side to maxDimension. Used to keep large uploads (e.g. full-resolution
 * phone photos) under the upload size budget before they're sent.
 */
export async function compressImageFile(
  file: File,
  maxDimension: number,
  quality: number,
): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.src = objectUrl;
    });

    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, maxDimension);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to compress image."))),
        "image/jpeg",
        quality,
      );
    });

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Merge Tailwind/conditional class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
