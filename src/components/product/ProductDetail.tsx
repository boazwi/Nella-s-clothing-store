"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";

export function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return <Alert tone="error">We couldn&apos;t find this product.</Alert>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        <div className="aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <h1 className="font-serif text-3xl text-ink">{product.name}</h1>
        <p className="mt-3 text-lg font-medium text-brand">
          {formatPrice(product.priceCents, product.currency)}
        </p>
        <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

        <div className="mt-8">
          <Link href={`/try-on?productId=${product.id}`}>
            <Button size="lg">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Try it on
            </Button>
          </Link>
          <p className="mt-2 text-xs text-muted">
            Upload a photo of yourself and see this piece on you.
          </p>
        </div>
      </div>
    </div>
  );
}
