"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import type { Product } from "@/types";

export function ProductTable() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [toDelete, setToDelete] = useState<Product | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </Button>
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="rounded-card border border-dashed border-muted/30 p-12 text-center text-muted">
          <p className="font-serif text-lg text-ink">No products yet</p>
          <p className="mt-1 text-sm">Add your first piece to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card bg-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-muted/15 text-muted">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-muted/10 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-14 w-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="line-clamp-1 max-w-xs text-muted">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-ink">
                    {formatPrice(product.priceCents, product.currency)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setToDelete(product)}>
                        <Trash2 className="h-4 w-4 text-danger" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Delete product">
        <p className="text-sm text-muted">
          Are you sure you want to delete{" "}
          <span className="font-medium text-ink">{toDelete?.name}</span>? This cannot be undone.
        </p>
        {deleteProduct.isError && (
          <Alert tone="error" className="mt-4">
            Couldn&apos;t delete the product. Please try again.
          </Alert>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={deleteProduct.isPending}
            onClick={() => {
              if (!toDelete) return;
              deleteProduct.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
            }}
          >
            {deleteProduct.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
