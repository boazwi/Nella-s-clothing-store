"use client";

import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/image";

/**
 * Garment selector (image2). Shows the catalog as selectable thumbnails and
 * reports the chosen product up to the parent.
 */
export function GarmentPicker({
  selectedId,
  onSelect,
  disabled,
}: {
  selectedId: string | null;
  onSelect: (product: Product) => void;
  disabled?: boolean;
}) {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {products?.map((product) => {
        const selected = product.id === selectedId;
        return (
          <button
            key={product.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(product)}
            aria-pressed={selected}
            aria-label={`Select ${product.name}`}
            className={cn(
              "overflow-hidden rounded-lg border-2 bg-background transition-colors disabled:cursor-not-allowed",
              selected ? "border-brand" : "border-transparent hover:border-accent",
            )}
          >
            <div className="aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
