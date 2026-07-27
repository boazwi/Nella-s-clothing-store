import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EditProductLoader } from "@/components/admin/EditProductLoader";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to products
      </Link>
      <h1 className="mb-6 font-serif text-2xl text-ink">Edit product</h1>
      <EditProductLoader id={params.id} />
    </div>
  );
}
