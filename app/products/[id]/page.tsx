import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductDetail } from "@/components/product/ProductDetail";

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to catalog
      </Link>
      <ProductDetail id={params.id} />
    </div>
  );
}
