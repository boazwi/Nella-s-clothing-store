"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/image";
import { ACCEPTED_IMAGE_MIME } from "@/lib/constants";

export function FileDropzone({
  onFile,
  label = "Click to upload or drag an image here",
  disabled,
}: {
  onFile: (file: File) => void;
  label?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (files && files[0]) onFile(files[0]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-8 text-center transition-colors",
        dragging ? "border-brand bg-brand/5" : "border-muted/30",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-brand",
      )}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <UploadCloud className="h-8 w-8 text-brand" aria-hidden="true" />
      <p className="text-sm text-muted">{label}</p>
      <p className="text-xs text-muted">JPG, PNG, or WebP · up to 10 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_MIME.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
