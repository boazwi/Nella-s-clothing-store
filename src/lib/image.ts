/**
 * Load an image URL, draw it onto a canvas, and export a raster PNG File.
 *
 * The try-on backend (n8n) cannot process vector images (SVG), so the garment
 * image — whatever its source format — is normalized to PNG here before being
 * sent. A white background is painted first so transparent areas render
 * predictably. Used to resolve the selected garment image (image2).
 */
export async function imageUrlToPngFile(url: string, filename: string): Promise<File> {
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

  const width = img.naturalWidth || 1024;
  const height = img.naturalHeight || 1024;
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

/** Merge Tailwind/conditional class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
