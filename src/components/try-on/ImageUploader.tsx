"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/Alert";
import { validateImageFile } from "@/lib/validation";

/**
 * Person-photo uploader (image1). Validates the file, shows a preview, and
 * hands the valid File up to the parent.
 */
export function ImageUploader({
  onChange,
  disabled,
}: {
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Revoke the object URL when it changes or on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(file: File) {
    const result = validateImageFile(file);
    if (!result.ok) {
      setError(result.message);
      onChange(null);
      return;
    }
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    onChange(file);
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    onChange(null);
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative overflow-hidden rounded-card bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Your uploaded photo" className="max-h-80 w-full object-contain" />
          {!disabled && (
            <button
              type="button"
              onClick={clear}
              aria-label="Remove photo"
              className="absolute right-2 top-2 rounded-full bg-ink/60 p-1 text-white hover:bg-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <FileDropzone
          onFile={handleFile}
          disabled={disabled}
          label="Upload a photo of yourself"
        />
      )}
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
