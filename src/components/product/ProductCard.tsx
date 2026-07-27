import Link from "next/link";
import type { Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <Card className="transition-shadow hover:shadow-elevated">
        <div className="aspect-[4/5] overflow-hidden bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg text-ink">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
          <p className="mt-2 font-medium text-brand">
            {formatPrice(product.priceCents, product.currency)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
