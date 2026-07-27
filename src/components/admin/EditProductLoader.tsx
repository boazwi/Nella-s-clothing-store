"use client";

import { useProduct } from "@/hooks/useProducts";
import { ProductForm } from "./ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";

export function EditProductLoader({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return <Alert tone="error">We couldn&apos;t find this product.</Alert>;
  }

  return <ProductForm product={product} />;
}
