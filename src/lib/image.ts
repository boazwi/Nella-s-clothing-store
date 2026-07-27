/**
 * Fetch an image URL and turn it into a File so it can be appended to a
 * multipart/form-data body (used to resolve the selected garment image).
 */
export async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load image: ${res.status}`);
  }
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  return new File([blob], filename, { type });
}

/** Merge Tailwind/conditional class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
