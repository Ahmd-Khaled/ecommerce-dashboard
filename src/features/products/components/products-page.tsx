"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProductsArchiveDialog } from "./products-archive-dialog";
import { ProductsFilters } from "./products-filters";
import { ProductsHeader } from "./products-header";
import { ProductsTable } from "./products-table";
import { useDeleteProduct, useProducts } from "../hooks/use-products";
import type { Product, ProductFilters, ProductSortBy, SortOrder } from "../types/product.types";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("Products");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<ProductSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);

  const filters = useMemo<ProductFilters>(() => ({
    page,
    limit: PAGE_SIZE,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(minPrice !== "" && Number.isFinite(Number(minPrice)) ? { minPrice: Number(minPrice) } : {}),
    ...(maxPrice !== "" && Number.isFinite(Number(maxPrice)) ? { maxPrice: Number(maxPrice) } : {}),
    sortBy,
    sortOrder,
  }), [page, search, minPrice, maxPrice, sortBy, sortOrder]);

  const productsQuery = useProducts(filters);
  const deleteMutation = useDeleteProduct();
  const products = productsQuery.data?.products ?? [];
  const pagination = productsQuery.data?.pagination;

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeMinPrice(value: string) {
    setMinPrice(value);
    setPage(1);
  }

  function changeMaxPrice(value: string) {
    setMaxPrice(value);
    setPage(1);
  }

  function changeSortBy(value: ProductSortBy) {
    setSortBy(value);
    setPage(1);
  }

  function toggleSort(column: ProductSortBy) {
    if (sortBy === column) {
      setSortOrder((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "name" ? "asc" : "desc");
    }
    setPage(1);
  }

  function archiveProduct() {
    if (!productToArchive) return;
    deleteMutation.mutate(productToArchive._id, {
      onSuccess: () => setProductToArchive(null),
    });
  }

  return (
    <div className="space-y-6 pb-8">
      <ProductsHeader title={t("title")} subtitle={t("subtitle")} addProduct={t("addProduct")} />
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <ProductsFilters
          search={search}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sortBy={sortBy}
          isArabic={isArabic}
          labels={{ search: t("search"), minPrice: t("minPrice"), maxPrice: t("maxPrice"), newest: t("sort.newest"), name: t("sort.name"), price: t("sort.price") }}
          onSearchChange={changeSearch}
          onMinPriceChange={changeMinPrice}
          onMaxPriceChange={changeMaxPrice}
          onSortChange={changeSortBy}
        />
        <ProductsTable
          products={products}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
          locale={locale}
          isArabic={isArabic}
          sortBy={sortBy}
          sortOrder={sortOrder}
          labels={{
            product: t("product"), category: t("category"), price: t("price"), inventory: t("inventory"), status: t("status"), actions: t("actions"),
            loading: t("loading"), loadError: t("loadError"), retry: t("retry"), noResults: t("noResults"), emptyHint: t("emptyHint"), addProduct: t("addProduct"),
            sku: t("sku", { sku: "{sku}" }), uncategorized: t("uncategorized"), inStock: t("inStock", { count: "{count}" }), outOfStock: t("outOfStock"), active: t("active"), inactive: t("inactive"),
            edit: t("edit"), archive: t("archive"), showing: t("showing", { count: "{count}", total: "{total}" }), productsCount: t("productsCount", { count: "{count}" }),
            previous: t("previous"), next: t("next"), pageOf: t("pageOf", { page: "{page}", total: "{total}" }),
          }}
          page={pagination?.page ?? page}
          totalPages={pagination?.totalPages ?? 1}
          hasNextPage={pagination?.hasNextPage ?? false}
          hasPreviousPage={pagination?.hasPreviousPage ?? false}
          isFetching={productsQuery.isFetching}
          total={pagination?.total ?? products.length}
          onSort={toggleSort}
          onPageChange={setPage}
          onArchive={setProductToArchive}
        />
      </section>
      {productToArchive && (
        <ProductsArchiveDialog
          isPending={deleteMutation.isPending}
          isArabic={isArabic}
          labels={{ title: t("archiveTitle"), description: t("archiveDescription", { name: productToArchive.name }), cancel: t("cancel"), confirm: t("archive"), archiving: t("archiving") }}
          onClose={() => setProductToArchive(null)}
          onConfirm={archiveProduct}
        />
      )}
    </div>
  );
}
