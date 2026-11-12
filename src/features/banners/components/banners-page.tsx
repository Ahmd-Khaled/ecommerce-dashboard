"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { ImageIcon, Megaphone, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateBanner, useDeleteBanner, useBanners, useUpdateBanner } from "../hooks/use-banners";
import { BannerFormDialog } from "./banner-form-dialog";
import type { Banner, BannerFilters, BannerLanguage, BannerPayload, BannerView } from "../types/banner.types";

export function BannersPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState<BannerLanguage | "all">("all");
  const [view, setView] = useState<BannerView | "all">("all");
  const [active, setActive] = useState<"all" | "true" | "false">("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const filters: BannerFilters = useMemo(() => ({
    page,
    limit: 10,
    ...(language !== "all" ? { language } : {}),
    ...(view !== "all" ? { view } : {}),
    ...(active !== "all" ? { isActive: active === "true" } : {}),
  }), [page, language, view, active]);

  const banners = useBanners(filters);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const pending = createBanner.isPending || updateBanner.isPending;
  const rows = (banners.data?.banners ?? []).filter((banner) => {
    const term = search.trim().toLowerCase();
    return !term || `${banner.title ?? ""} ${banner.altText ?? ""}`.toLowerCase().includes(term);
  });

  const text = {
    title: isArabic ? "إدارة البنرات" : "Banner management",
    subtitle: isArabic ? "إدارة الصور الترويجية حسب اللغة ونوع العرض وجدول النشر." : "Manage promotional banners by language, placement, and schedule.",
    add: isArabic ? "إضافة بانر" : "Add banner",
    search: isArabic ? "ابحث في الصفحة الحالية..." : "Search this page...",
    allLanguages: isArabic ? "كل اللغات" : "All languages",
    allViews: isArabic ? "كل أنواع العرض" : "All placements",
    allStatuses: isArabic ? "كل الحالات" : "All statuses",
    active: isArabic ? "مفعل" : "Active",
    inactive: isArabic ? "غير مفعل" : "Inactive",
    desktop: isArabic ? "سطح المكتب" : "Desktop",
    mobile: isArabic ? "الهاتف" : "Mobile",
    image: isArabic ? "الصورة" : "Preview",
    titleColumn: isArabic ? "العنوان" : "Title",
    language: isArabic ? "اللغة" : "Language",
    view: isArabic ? "العرض" : "Placement",
    status: isArabic ? "الحالة" : "Status",
    schedule: isArabic ? "الجدولة" : "Schedule",
    order: isArabic ? "الترتيب" : "Order",
    actions: isArabic ? "الإجراءات" : "Actions",
    edit: isArabic ? "تعديل" : "Edit",
    delete: isArabic ? "حذف" : "Delete",
    noResults: isArabic ? "لا توجد بنرات مطابقة." : "No banners found.",
    loading: isArabic ? "جارٍ تحميل البنرات..." : "Loading banners...",
    error: isArabic ? "تعذر تحميل البنرات." : "Unable to load banners.",
    previous: isArabic ? "السابق" : "Previous",
    next: isArabic ? "التالي" : "Next",
    page: isArabic ? "صفحة" : "Page",
    of: isArabic ? "من" : "of",
    deleteConfirm: isArabic ? "هل أنت متأكد من حذف هذا البانر؟" : "Are you sure you want to delete this banner?",
    noTitle: isArabic ? "بدون عنوان" : "Untitled banner",
    refresh: isArabic ? "تحديث" : "Refresh",
  };

  function openCreate() {
    setSelectedBanner(null);
    setDialogOpen(true);
  }

  function openEdit(banner: Banner) {
    setSelectedBanner(banner);
    setDialogOpen(true);
  }

  function submit(payload: BannerPayload) {
    if (selectedBanner) {
      updateBanner.mutate({ id: selectedBanner._id, payload }, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      createBanner.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  }

  function remove(banner: Banner) {
    if (!window.confirm(text.deleteConfirm)) return;
    deleteBanner.mutate(banner._id);
  }

  function changeFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  const pagination = banners.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{text.title}</h1><p className="mt-1 text-sm text-muted-foreground">{text.subtitle}</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => void banners.refetch()} disabled={banners.isFetching}><RefreshCw className={`me-2 size-4 ${banners.isFetching ? "animate-spin" : ""}`} />{text.refresh}</Button><Button onClick={openCreate}><Plus className="me-2 size-4" />{text.add}</Button></div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="size-4 text-primary" />{text.title}</CardTitle><CardDescription>{pagination ? `${pagination.total} ${isArabic ? "بانر" : "banners"}` : ""}</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text.search} />
            <select aria-label={text.language} value={language} onChange={(event) => changeFilter(setLanguage, event.target.value as BannerLanguage | "all")} className="h-8 rounded-lg border bg-background px-3 text-sm"><option value="all">{text.allLanguages}</option><option value="en">English</option><option value="ar">العربية</option></select>
            <select aria-label={text.view} value={view} onChange={(event) => changeFilter(setView, event.target.value as BannerView | "all")} className="h-8 rounded-lg border bg-background px-3 text-sm"><option value="all">{text.allViews}</option><option value="desktop">{text.desktop}</option><option value="mobile">{text.mobile}</option></select>
            <select aria-label={text.status} value={active} onChange={(event) => changeFilter(setActive, event.target.value as "all" | "true" | "false")} className="h-8 rounded-lg border bg-background px-3 text-sm"><option value="all">{text.allStatuses}</option><option value="true">{text.active}</option><option value="false">{text.inactive}</option></select>
          </div>

          {banners.isPending ? <div className="py-12 text-center text-sm text-muted-foreground">{text.loading}</div> : null}
          {banners.isError ? <div className="py-12 text-center text-sm text-destructive">{text.error}<div className="mt-3"><Button size="sm" variant="outline" onClick={() => void banners.refetch()}>{text.refresh}</Button></div></div> : null}
          {banners.data && rows.length === 0 ? <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground"><ImageIcon className="size-8" />{text.noResults}</div> : null}
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead><tr className="border-b text-start text-xs text-muted-foreground"><th className="pb-3 font-medium">{text.image}</th><th className="pb-3 font-medium">{text.titleColumn}</th><th className="pb-3 font-medium">{text.language}</th><th className="pb-3 font-medium">{text.view}</th><th className="pb-3 font-medium">{text.status}</th><th className="pb-3 font-medium">{text.schedule}</th><th className="pb-3 font-medium">{text.order}</th><th className="pb-3 font-medium">{text.actions}</th></tr></thead>
                <tbody>{rows.map((banner) => (
                  <tr key={banner._id} className="border-b last:border-0">
                    <td className="py-3"><Image src={banner.image} alt={banner.altText || banner.title || "Banner"} width={96} height={56} unoptimized className="h-14 w-24 rounded-lg border bg-muted object-cover" /></td>
                    <td className="max-w-48 py-3"><p className="truncate font-medium">{banner.title || text.noTitle}</p><p className="truncate text-xs text-muted-foreground">{banner.altText}</p></td>
                    <td className="py-3"><Badge variant="outline">{banner.language.toUpperCase()}</Badge></td>
                    <td className="py-3">{banner.view === "desktop" ? text.desktop : text.mobile}</td>
                    <td className="py-3"><Badge variant={banner.isActive ? "secondary" : "outline"}>{banner.isActive ? text.active : text.inactive}</Badge></td>
                    <td className="py-3 text-xs text-muted-foreground"><span>{banner.startsAt ? new Date(banner.startsAt).toLocaleString(locale) : "—"}</span><span className="block">{banner.endsAt ? new Date(banner.endsAt).toLocaleString(locale) : "—"}</span></td>
                    <td className="py-3 tabular-nums">{banner.sortOrder}</td>
                    <td className="py-3"><div className="flex items-center gap-1"><Button size="icon" variant="ghost" aria-label={text.edit} onClick={() => openEdit(banner)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label={text.delete} disabled={deleteBanner.isPending} onClick={() => remove(banner)}><Trash2 className="size-4 text-destructive" /></Button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : null}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{text.page} {pagination.page} {text.of} {pagination.totalPages}</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{text.previous}</Button><Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>{text.next}</Button></div></div>
          ) : null}
        </CardContent>
      </Card>

      <BannerFormDialog open={dialogOpen} banner={selectedBanner} isPending={pending} isArabic={isArabic} onClose={() => setDialogOpen(false)} onSubmit={submit} />
    </div>
  );
}
