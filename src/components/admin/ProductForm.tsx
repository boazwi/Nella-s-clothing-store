"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product } from "@/types";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { productService } from "@/services/products";
import { validateImageFile } from "@/lib/validation";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { FileDropzone } from "@/components/ui/FileDropzone";

// UI schema: price is entered in major units (₪) and converted to cents.
const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  price: z.coerce.number().nonnegative("Price cannot be negative."),
  currency: z.enum(["ILS", "USD", "EUR"]),
});
type FormValues = z.infer<typeof formSchema>;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? product.priceCents / 100 : 0,
      currency: product?.currency ?? DEFAULT_CURRENCY,
    },
  });

  // Revoke object URL created from a freshly uploaded (unsaved) file.
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  async function handleImageFile(file: File) {
    const result = validateImageFile(file);
    if (!result.ok) {
      setImageError(result.message);
      return;
    }
    setImageError(null);
    const url = await productService.uploadProductImage(file);
    setImageUrl(url);
  }

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    if (!imageUrl) {
      setImageError("A product image is required.");
      return;
    }
    const payload = {
      name: values.name,
      description: values.description,
      priceCents: Math.round(values.price * 100),
      currency: values.currency,
      imageUrl,
    };

    try {
      if (isEdit && product) {
        await updateProduct.mutateAsync({ id: product.id, patch: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      router.push("/admin");
    } catch {
      setSubmitError("Couldn't save the product. Please try again.");
    }
  }

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 md:grid-cols-2" noValidate>
      {/* Image */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-ink">Product image</label>
        {imageUrl ? (
          <div className="overflow-hidden rounded-card bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Product preview" className="max-h-80 w-full object-contain" />
          </div>
        ) : null}
        <FileDropzone
          onFile={handleImageFile}
          label={imageUrl ? "Replace image" : "Upload product image"}
        />
        {imageError && <Alert tone="error">{imageError}</Alert>}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <Input label="Name" error={errors.name?.message} {...register("name")} />
        <Textarea
          label="Description"
          rows={4}
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register("price")}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currency" className="text-sm font-medium text-ink">
              Currency
            </label>
            <select
              id="currency"
              className="rounded-lg border border-muted/30 bg-surface px-3 py-2 text-ink focus-visible:border-brand focus-visible:outline-none"
              {...register("currency")}
            >
              <option value="ILS">₪ ILS</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
        </div>

        {submitError && <Alert tone="error">{submitError}</Alert>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/admin")}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
