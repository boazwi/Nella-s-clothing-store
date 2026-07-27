"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";

export function ProductGrid() {
  const { data: products, isLoading, isError } = useProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <Alert tone="error">We couldn&apos;t load the catalog. Please try again.</Alert>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-muted/30 p-12 text-center text-muted">
        <p className="font-serif text-lg text-ink">No products yet</p>
        <p className="mt-1 text-sm">Check back soon — new pieces are on the way.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
