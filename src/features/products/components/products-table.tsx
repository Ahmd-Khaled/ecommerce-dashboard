"use client";

import Link from "next/link";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Product, ProductSortBy, SortOrder } from "../types/product.types";
import { ImagePreview } from "./image-preview";

type Labels = {
  product: string;
  category: string;
  price: string;
  inventory: string;
  status: string;
  actions: string;
  loading: string;
  loadError: string;
  retry: string;
  noResults: string;
  emptyHint: string;
  addProduct: string;
  sku: string;
  uncategorized: string;
  inStock: string;
  outOfStock: string;
  active: string;
  inactive: string;
  edit: string;
  archive: string;
  showing: string;
  productsCount: string;
  previous: string;
  next: string;
  pageOf: string;
};

type Props = {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  locale: string;
  isArabic: boolean;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
  labels: Labels;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFetching: boolean;
  total: number;
  onSort: (column: ProductSortBy) => void;
  onPageChange: (page: number) => void;
  onArchive: (product: Product) => void;
};

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: ProductSortBy;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
}) {
  if (sortBy !== column)
    return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
  return sortOrder === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

function categoryName(product: Product, fallback: string) {
  return typeof product.category === "string"
    ? product.category
    : (product.category?.name ?? fallback);
}

export function ProductsTable({
  products,
  isLoading,
  isError,
  locale,
  isArabic,
  sortBy,
  sortOrder,
  labels,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  isFetching,
  total,
  onSort,
  onPageChange,
  onArchive,
}: Props) {
  if (isLoading || isError || products.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
        {isLoading ? (
          <>
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{labels.loading}</p>
          </>
        ) : isError ? (
          <>
            <Package className="size-8 text-muted-foreground" />
            <p className="font-medium">{labels.loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {labels.retry}
            </button>
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <Package className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">{labels.noResults}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.emptyHint}
              </p>
            </div>
            <Link
              href="products/new"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              <span aria-hidden="true">+</span>
              {labels.addProduct}
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b bg-muted/30 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => onSort("name")}
                  className="inline-flex items-center gap-2"
                >
                  {labels.product}
                  <SortIcon
                    column="name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </th>
              <th scope="col" className="px-4 py-3.5">
                {labels.category}
              </th>
              <th scope="col" className="px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => onSort("price")}
                  className="inline-flex items-center gap-2"
                >
                  {labels.price}
                  <SortIcon
                    column="price"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </th>
              <th scope="col" className="px-4 py-3.5">
                {labels.inventory}
              </th>
              <th scope="col" className="px-4 py-3.5">
                {labels.status}
              </th>
              <th scope="col" className="px-5 py-3.5 text-end">
                {labels.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product._id} className="transition hover:bg-muted/20">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                      {product.images?.[0] ? (
                        <ImagePreview
                          images={product.images}
                          alt={product.name}
                          className="size-full"
                        />
                      ) : (
                        <ImageIcon className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-64 truncate text-sm font-semibold">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {labels.sku.replace("{sku}", product.sku)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {categoryName(product, labels.uncategorized)}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold">
                    {formatCurrency(product.price, locale)}
                  </div>
                  {product.compareAtPrice != null && (
                    <div className="mt-1 text-xs text-muted-foreground line-through">
                      {formatCurrency(product.compareAtPrice, locale)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`text-sm font-medium ${product.stock === 0 ? "text-destructive" : product.stock <= 5 ? "text-amber-600" : "text-foreground"}`}
                  >
                    {labels.inStock.replace("{count}", String(product.stock))}
                  </span>
                  {product.stock === 0 && (
                    <p className="mt-1 text-xs text-destructive">
                      {labels.outOfStock}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${product.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${product.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`}
                    />
                    {product.isActive ? labels.active : labels.inactive}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`products/${product._id}/edit`}
                      className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition hover:bg-muted"
                    >
                      {labels.edit}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onArchive(product)}
                      title={labels.archive}
                      aria-label={`${labels.archive}: ${product.name}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Archive className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {labels.showing
            .replace("{count}", String(products.length))
            .replace("{total}", String(total))}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={!hasPreviousPage || isFetching}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isArabic ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
            {labels.previous}
          </button>
          <span className="min-w-16 text-center text-sm font-medium">
            {labels.pageOf
              .replace("{page}", String(page))
              .replace("{total}", String(totalPages))}
          </span>
          <button
            type="button"
            disabled={!hasNextPage || isFetching}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.next}
            {isArabic ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
