"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { ProductSortBy } from "../types/product.types";

type Props = {
  search: string; minPrice: string; maxPrice: string; sortBy: ProductSortBy; isArabic: boolean;
  labels: { search: string; minPrice: string; maxPrice: string; newest: string; name: string; price: string };
  onSearchChange: (value: string) => void; onMinPriceChange: (value: string) => void; onMaxPriceChange: (value: string) => void; onSortChange: (value: ProductSortBy) => void;
};

export function ProductsFilters({ search, minPrice, maxPrice, sortBy, isArabic, labels, onSearchChange, onMinPriceChange, onMaxPriceChange, onSortChange }: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className={`absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`} />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={labels.search} className={`h-10 w-full rounded-xl border border-input bg-background text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${isArabic ? "pr-9 pl-3" : "pl-9 pr-3"}`} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 items-center gap-2 rounded-xl border border-input px-3">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <input type="number" min="0" value={minPrice} onChange={(event) => onMinPriceChange(event.target.value)} placeholder={labels.minPrice} aria-label={labels.minPrice} className="w-24 bg-transparent text-sm outline-none" />
          <span aria-hidden="true" className="text-muted-foreground">–</span>
          <input type="number" min="0" value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value)} placeholder={labels.maxPrice} aria-label={labels.maxPrice} className="w-24 bg-transparent text-sm outline-none" />
        </div>
        <select value={sortBy} onChange={(event) => onSortChange(event.target.value as ProductSortBy)} aria-label={labels.newest} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary">
          <option value="createdAt">{labels.newest}</option><option value="name">{labels.name}</option><option value="price">{labels.price}</option>
        </select>
      </div>
    </div>
  );
}
