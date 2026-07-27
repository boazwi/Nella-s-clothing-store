"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { Product } from "@/types";
import { useProduct } from "@/hooks/useProducts";
import { useTryOn } from "@/hooks/useTryOn";
import { ImageUploader } from "./ImageUploader";
import { GarmentPicker } from "./GarmentPicker";
import { ProgressState } from "./ProgressState";
import { ResultView } from "./ResultView";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

export function TryOnFlow() {
  const searchParams = useSearchParams();
  const preselectId = searchParams.get("productId") ?? "";
  const { data: preselected } = useProduct(preselectId);

  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garment, setGarment] = useState<Product | null>(null);
  const { status, resultUrl, errorMessage, run, reset } = useTryOn();

  // Apply the product passed via ?productId= once it loads.
  useEffect(() => {
    if (preselected) setGarment(preselected);
  }, [preselected]);

  const submitting = status === "submitting";
  const canSubmit = Boolean(personFile && garment) && !submitting;

  if (submitting) return <ProgressState />;

  if (status === "success" && resultUrl) {
    return (
      <ResultView
        imageUrl={resultUrl}
        onTryAnother={() => {
          reset();
          setGarment(null);
        }}
      />
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Step 1: person photo */}
      <Card className="p-6">
        <h2 className="mb-1 font-serif text-xl text-ink">1. Upload your photo</h2>
        <p className="mb-4 text-sm text-muted">A clear, front-facing photo works best.</p>
        <ImageUploader onChange={setPersonFile} />
      </Card>

      {/* Step 2: garment */}
      <Card className="p-6">
        <h2 className="mb-1 font-serif text-xl text-ink">2. Choose an item</h2>
        <p className="mb-4 text-sm text-muted">
          {garment ? `Selected: ${garment.name}` : "Pick a piece to try on."}
        </p>
        <GarmentPicker
          selectedId={garment?.id ?? null}
          onSelect={setGarment}
        />
      </Card>

      {/* Step 3: generate */}
      <div className="md:col-span-2">
        {status === "error" && errorMessage && (
          <Alert tone="error" className="mb-4">
            {errorMessage}
          </Alert>
        )}
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={!canSubmit}
          onClick={() => personFile && garment && run(personFile, garment)}
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          {status === "error" ? "Try again" : "Generate my try-on"}
        </Button>
        {!canSubmit && !submitting && (
          <p className="mt-2 text-xs text-muted">
            Upload a photo and select an item to continue.
          </p>
        )}
      </div>
    </div>
  );
}
