"use client";

import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ResultView({
  imageUrl,
  onTryAnother,
}: {
  imageUrl: string;
  onTryAnother: () => void;
}) {
  function handleDownload() {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "nella-try-on.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-card bg-background shadow-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="You wearing the selected item" className="w-full object-contain" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Download image
        </Button>
        <Button variant="ghost" onClick={onTryAnother}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try another item
        </Button>
      </div>
    </div>
  );
}
