"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Package, RefreshCw } from "lucide-react";

import { ProductForm } from "@/features/products/components/product-form";
import { useProduct } from "@/features/products/hooks/use-products";

export default function EditProductPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;

  const { data: product, isLoading, isError, refetch } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <Package className="size-6 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-bold">Product not found</h2>

        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We could not load this product. It may have been deleted or there may
          be a temporary connection problem.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>

          <Link
            href="/products"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
