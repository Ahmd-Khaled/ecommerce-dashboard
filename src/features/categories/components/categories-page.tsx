"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Folder,
  Package,
  Layers3,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/use-categories";

import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryDeleteDialog } from "./category-delete-dialog";

import type { Category, CategoryPayload } from "../types/category.types";

const PAGE_SIZE = 10;

type FlatCategory = {
  category: Category;
  depth: number;
};

type SortDirection = "asc" | "desc";

type CategoryStatus = "all" | "active" | "inactive";

type CategoryParentFilter = "all" | "root" | string;

function getParentId(category: Category): string | undefined {
  return typeof category.parent === "string"
    ? category.parent
    : category.parent?._id;
}

/**
 * Flattens the category hierarchy while preserving parent-child order.
 * Sorting is performed between siblings only.
 */
function flattenCategories(
  categories: Category[],
  direction: SortDirection,
): FlatCategory[] {
  const result: FlatCategory[] = [];
  const visited = new Set<string>();

  const sortSiblings = (items: Category[]) =>
    [...items].sort((a, b) => {
      const comparison = a.sortOrder - b.sortOrder;

      return direction === "asc" ? comparison : -comparison;
    });

  const childrenMap = new Map<string, Category[]>();

  categories.forEach((category) => {
    const parentId = getParentId(category);

    if (!parentId) return;

    const siblings = childrenMap.get(parentId) ?? [];

    siblings.push(category);
    childrenMap.set(parentId, siblings);
  });

  function visit(category: Category, depth: number) {
    if (visited.has(category._id)) return;

    visited.add(category._id);

    result.push({
      category,
      depth,
    });

    const children = sortSiblings(childrenMap.get(category._id) ?? []);

    children.forEach((child) => visit(child, depth + 1));
  }

  const roots = sortSiblings(
    categories.filter((category) => !getParentId(category)),
  );

  roots.forEach((root) => visit(root, 0));

  // Include orphaned records and circular references defensively.
  sortSiblings(categories).forEach((category) => {
    if (!visited.has(category._id)) {
      visit(category, 0);
    }
  });

  return result;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default function CategoriesPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("Categories");

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CategoryStatus>("all");
  const [parentFilter, setParentFilter] = useState<CategoryParentFilter>("all");

  const [sortOrder, setSortOrder] = useState<SortDirection>("asc");

  const [page, setPage] = useState(1);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Queries and mutations
  const categoriesQuery = useCategories();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = categoriesQuery.data ?? [];

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Hierarchical categories
  const flattened = useMemo(
    () => flattenCategories(categories, sortOrder),
    [categories, sortOrder],
  );

  // Statistics
  const activeCount = useMemo(
    () => categories.filter((category) => category.isActive).length,
    [categories],
  );

  const totalProducts = useMemo(
    () =>
      categories.reduce(
        (total, category) => total + (category.productCount ?? 0),
        0,
      ),
    [categories],
  );

  // Filtering
  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return flattened.filter(({ category }) => {
      const matchesSearch =
        !normalizedSearch ||
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        status === "all" ||
        (status === "active" && category.isActive) ||
        (status === "inactive" && !category.isActive);

      const parentId = getParentId(category);

      const matchesParent =
        parentFilter === "all" ||
        (parentFilter === "root" && !parentId) ||
        parentId === parentFilter;

      return matchesSearch && matchesStatus && matchesParent;
    });
  }, [flattened, search, status, parentFilter]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const showingFrom =
    filteredCategories.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const showingTo = Math.min(
    currentPage * PAGE_SIZE,
    filteredCategories.length,
  );

  // Filter handlers
  function resetFilters() {
    setSearch("");
    setStatus("all");
    setParentFilter("all");
    setSortOrder("asc");
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: CategoryStatus) {
    setStatus(value);
    setPage(1);
  }

  function handleParentChange(value: string) {
    setParentFilter(value);
    setPage(1);
  }

  function toggleSortOrder() {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    setPage(1);
  }

  // Create and edit handlers
  function openCreate() {
    setSelectedCategory(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setSelectedCategory(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setSelectedCategory(null);
  }

  async function handleSave(payload: CategoryPayload) {
    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync({
          id: selectedCategory._id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      closeForm();
      setPage(1);
    } catch {
      // Mutation hooks already handle and display API errors.
      // Keep the dialog open so the user can correct the form.
    }
  }

  // Delete handlers
  function openDelete(category: Category) {
    setDeleteTarget(category);
  }

  function closeDelete() {
    if (deleteMutation.isPending) return;

    setDeleteTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget._id);

      setDeleteTarget(null);
    } catch {
      // Mutation hook displays the backend error.
      // Keep the confirmation dialog open.
    }
  }

  // Status handler
  async function toggleStatus(category: Category) {
    const parentId = getParentId(category);

    try {
      await updateMutation.mutateAsync({
        id: category._id,
        payload: {
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          parent: parentId ?? null,
          isActive: !category.isActive,
          sortOrder: category.sortOrder,
        },
      });
    } catch {
      // Mutation hook handles the API error.
    }
  }

  return (
    <div className="space-y-6 pb-8" dir={isArabic ? "rtl" : "ltr"}>
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderTree className="size-4 shrink-0" />
            <span>{t("breadcrumb")}</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => void categoriesQuery.refetch()}
            disabled={categoriesQuery.isFetching}
            aria-label={t("refresh")}
          >
            <RefreshCw
              className={`size-4 ${
                categoriesQuery.isFetching ? "animate-spin" : ""
              }`}
            />
          </Button>

          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t("addCategory")}
          </Button>
        </div>
      </header>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Layers3 className="size-5" />}
          label={t("totalCategories")}
          value={categories.length}
        />

        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label={t("activeCategories")}
          value={activeCount}
        />

        <StatCard
          icon={<Package className="size-5" />}
          label={t("directProducts")}
          value={totalProducts}
        />
      </section>

      {/* Categories Table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-border p-4 xl:flex-row xl:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              className={`absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${
                isArabic ? "right-3" : "left-3"
              }`}
            />

            <input
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={t("search")}
              className={`h-10 w-full rounded-xl border border-input bg-background text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                isArabic ? "pr-9 pl-3" : "pl-9 pr-3"
              }`}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(event) =>
                handleStatusChange(event.target.value as CategoryStatus)
              }
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">{t("allStatuses")}</option>

              <option value="active">{t("active")}</option>

              <option value="inactive">{t("inactive")}</option>
            </select>

            <select
              value={parentFilter}
              onChange={(event) => handleParentChange(event.target.value)}
              className="h-10 max-w-48 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">{t("allParents")}</option>

              <option value="root">{t("rootCategories")}</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              aria-label={t("sort")}
              title={t("sort")}
            >
              <ArrowUpDown className="size-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {t("clearFilters")}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th
                  className={`px-5 py-4 font-semibold ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {t("category")}
                </th>

                <th
                  className={`px-5 py-4 font-semibold ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {t("products")}
                </th>

                <th
                  className={`px-5 py-4 font-semibold ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {t("sortOrder")}
                </th>

                <th
                  className={`px-5 py-4 font-semibold ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {t("status")}
                </th>

                <th className="px-5 py-4 text-end font-semibold">
                  {t("actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {categoriesQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center text-muted-foreground"
                  >
                    {t("loading")}
                  </td>
                </tr>
              ) : categoriesQuery.isError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <p className="mb-3 text-sm text-destructive">
                      {t("loadError")}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void categoriesQuery.refetch()}
                    >
                      {t("retry")}
                    </Button>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <Folder className="mx-auto mb-3 size-9 text-muted-foreground/50" />

                    <p className="font-medium">{t("noResults")}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("emptyDescription")}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map(({ category, depth }) => (
                  <tr
                    key={category._id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* Category */}
                    <td className="px-5 py-3">
                      <div
                        className="flex items-center gap-3"
                        style={{
                          paddingInlineStart: `${depth * 24}px`,
                        }}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                          {category.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={category.image}
                              alt={category.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Folder className="size-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {category.name}
                          </p>

                          <p
                            dir="ltr"
                            className="mt-0.5 text-xs text-muted-foreground"
                          >
                            {category.slug}
                          </p>

                          {depth > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              {t("subCategory")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Products */}
                    <td className="px-5 py-3">
                      <div className="space-y-1">
                        <p className="font-semibold tabular-nums">
                          {category.productCount ?? 0}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {t("totalProducts", {
                            count: category.totalProductCount ?? 0,
                          })}
                        </p>
                      </div>
                    </td>

                    {/* Sort Order */}
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">
                      {category.sortOrder}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        disabled={updateMutation.isPending}
                        onClick={() => void toggleStatus(category)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          category.isActive
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {category.isActive ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <XCircle className="size-3.5" />
                        )}

                        {category.isActive ? t("active") : t("inactive")}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(category)}
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDelete(category)}
                          aria-label={t("delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!categoriesQuery.isLoading && !categoriesQuery.isError && (
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {t("showing", {
                from: showingFrom,
                to: showingTo,
                total: filteredCategories.length,
              })}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                {isArabic ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}

                {t("previous")}
              </Button>

              <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                {t("next")}

                {isArabic ? (
                  <ChevronLeft className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Create / Edit Dialog */}
      <CategoryFormDialog
        open={formOpen}
        category={selectedCategory}
        categories={categories}
        isPending={isSaving}
        onClose={closeForm}
        onSubmit={(payload) => void handleSave(payload)}
      />

      {/* Delete Dialog */}
      <CategoryDeleteDialog
        open={Boolean(deleteTarget)}
        category={deleteTarget}
        isPending={deleteMutation.isPending}
        onClose={closeDelete}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
