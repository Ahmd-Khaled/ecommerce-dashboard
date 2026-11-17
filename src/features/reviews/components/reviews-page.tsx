"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Check, ChevronDown, ChevronLeft, ChevronRight, EyeOff, RefreshCw, RotateCcw, ShieldCheck, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/features/admin-auth/hooks/use-admin-auth";
import { AdminRoleEnum } from "@/features/admin-management/types/admin.types";
import { useModerateReview, useRestoreReview, useReviewSettings, useReviews, useUpdateReviewSettings } from "../hooks/use-reviews";
import type { ReviewFilters, ReviewState } from "../types/review.types";

const PAGE_SIZE = 20;
const states: ReviewState[] = ["pending", "published", "hidden", "removed"];
const copy = {
  en: {
    title: "Product reviews", subtitle: "Moderate customer feedback and control review publication.",
    refresh: "Refresh", auto: "Automatically publish new reviews", autoHint: "When disabled, new reviews enter the pending queue.",
    filters: "Filters", product: "Product ID", productHint: "Filter by product MongoDB ID", state: "Review state", all: "All states", pendingQueue: "New / pending queue",
    results: "Moderation queue", loading: "Loading reviews…", error: "Could not load reviews.", retry: "Try again", empty: "No reviews found.",
    customer: "Customer", productName: "Product", rating: "Rating", review: "Review", submitted: "Submitted", status: "Status", actions: "Actions",
    publish: "Publish", hide: "Hide", remove: "Remove", restore: "Restore", reason: "Optional moderation reason", reasonPrompt: "Enter an optional moderation reason:",
    history: "Moderation history", previous: "Previous", next: "Next", page: "Cursor page", noText: "No written feedback", inactive: "Archived product",
    restoreHint: "Restoration returns the review to hidden; publish it separately.", settingsError: "Could not load review settings.",
  },
  ar: {
    title: "تقييمات المنتجات", subtitle: "مراجعة آراء العملاء والتحكم في نشر التقييمات.",
    refresh: "تحديث", auto: "نشر التقييمات الجديدة تلقائياً", autoHint: "عند التعطيل، تدخل التقييمات الجديدة قائمة الانتظار للمراجعة.",
    filters: "عوامل التصفية", product: "معرّف المنتج", productHint: "التصفية باستخدام معرّف MongoDB للمنتج", state: "حالة التقييم", all: "كل الحالات", pendingQueue: "الجديدة / قيد المراجعة",
    results: "قائمة المراجعة", loading: "جارٍ تحميل التقييمات…", error: "تعذر تحميل التقييمات.", retry: "إعادة المحاولة", empty: "لا توجد تقييمات.",
    customer: "العميل", productName: "المنتج", rating: "التقييم", review: "المراجعة", submitted: "تاريخ الإرسال", status: "الحالة", actions: "الإجراءات",
    publish: "نشر", hide: "إخفاء", remove: "حذف", restore: "استعادة", reason: "سبب المراجعة (اختياري)", reasonPrompt: "أدخل سبباً اختيارياً لإجراء المراجعة:",
    history: "سجل الإشراف", previous: "السابق", next: "التالي", page: "صفحة المؤشر", noText: "لا يوجد نص للمراجعة", inactive: "منتج مؤرشف",
    restoreHint: "تُعيد الاستعادة التقييم إلى حالة مخفي؛ يجب نشره بشكل منفصل.", settingsError: "تعذر تحميل إعدادات التقييمات.",
  },
} as const;

function stateStyle(state: ReviewState) {
  switch (state) {
    case "published": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
    case "pending": return "border-amber-500/30 bg-amber-500/10 text-amber-700";
    case "hidden": return "border-slate-500/30 bg-slate-500/10 text-slate-600";
    case "removed": return "border-red-500/30 bg-red-500/10 text-red-700";
  }
}

export default function ReviewsPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = copy[isArabic ? "ar" : "en"];
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === AdminRoleEnum.SUPER_ADMIN;
  const [productId, setProductId] = useState("");
  const [state, setState] = useState<ReviewState | "all">("all");
  const [newOnly, setNewOnly] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack.at(-1);
  const filters = useMemo<ReviewFilters>(() => ({
    limit: PAGE_SIZE,
    ...(cursor ? { after: cursor } : {}),
    ...(productId.trim() ? { productId: productId.trim() } : {}),
    ...(state !== "all" ? { state } : {}),
    ...(newOnly ? { queue: "new" as const } : {}),
  }), [cursor, productId, state, newOnly]);

  const query = useReviews(filters);
  const settings = useReviewSettings();
  const updateSettings = useUpdateReviewSettings();
  const moderate = useModerateReview();
  const restore = useRestoreReview();
  const rows = query.data?.reviews ?? [];

  function resetPaging() { setCursorStack([]); }
  function changeState(value: string) { setState(value as ReviewState | "all"); setNewOnly(false); resetPaging(); }
  function moderateReview(id: string, target: "published" | "hidden" | "removed") {
    const reason = window.prompt(t.reasonPrompt);
    if (reason === null) return;
    moderate.mutate({ id, state: target, ...(reason.trim() ? { reason: reason.trim() } : {}) });
  }
  function restoreReview(id: string) {
    const reason = window.prompt(t.reasonPrompt);
    if (reason === null) return;
    restore.mutate({ id, ...(reason.trim() ? { reason: reason.trim() } : {}) });
  }
  const formatDate = (value: string) => new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Star className="size-5" /></div>
            <div><h1 className="text-2xl font-bold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p></div>
          </div>
        </div>
        <Button variant="outline" onClick={() => { void query.refetch(); void settings.refetch(); }} disabled={query.isFetching || settings.isFetching}>
          <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} />{t.refresh}
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><h2 className="font-semibold">{t.auto}</h2></div>
          {settings.isLoading ? <div className="h-10 animate-pulse rounded-lg bg-muted" /> : settings.isError ? <p className="text-sm text-destructive">{t.settingsError}</p> : (
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 size-4 accent-primary" checked={settings.data?.autoApproveReviews ?? false}
                disabled={updateSettings.isPending}
                onChange={(event) => updateSettings.mutate({ autoApproveReviews: event.target.checked })} />
              <span className="text-sm text-muted-foreground">{t.autoHint}</span>
            </label>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><ChevronDown className="size-4 text-primary" />{t.filters}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="review-product" className="text-xs font-medium text-muted-foreground">{t.product}</label>
              <Input id="review-product" value={productId} placeholder={t.productHint} onChange={(e) => { setProductId(e.target.value); resetPaging(); }} /></div>
            <div className="space-y-2"><label htmlFor="review-state" className="text-xs font-medium text-muted-foreground">{t.state}</label>
              <select id="review-state" value={state} onChange={(e) => changeState(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="all">{t.all}</option>{states.map((item) => <option key={item} value={item}>{item}</option>)}
              </select></div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={newOnly} onChange={(e) => { setNewOnly(e.target.checked); setState("all"); resetPaging(); }} className="size-4 accent-primary" />{t.pendingQueue}</label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><h2 className="font-semibold">{t.results}</h2><p className="mt-1 text-xs text-muted-foreground">{rows.length} · {t.page} {cursorStack.length + 1}</p></div><Badge variant="secondary">{rows.length}</Badge></div>
        {query.isLoading ? <div className="flex min-h-56 items-center justify-center gap-3 text-muted-foreground"><RefreshCw className="size-5 animate-spin" />{t.loading}</div>
        : query.isError ? <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-5 text-center"><p className="text-sm text-destructive">{t.error}</p><Button variant="outline" onClick={() => void query.refetch()}>{t.retry}</Button></div>
        : rows.length === 0 ? <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">{t.empty}</div>
        : <div className="divide-y divide-border">
          {rows.map((review) => <article key={review.id} className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{[review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") || review.user?.email || t.customer}</span><Badge className={stateStyle(review.state)}>{review.state}</Badge>{review.product?.isActive === false && <Badge variant="outline">{t.inactive}</Badge>}</div>
                <p className="text-xs text-muted-foreground">{review.product?.name ?? review.productId} · {formatDate(review.createdAt)}</p>
                <div className="flex items-center gap-1 text-amber-500" aria-label={`${review.rating} / 5`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-4 ${i < review.rating ? "fill-current" : ""}`} />)}<span className="ms-1 text-xs text-muted-foreground">{review.rating}/5</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {review.state !== "published" && review.state !== "removed" && <Button size="sm" onClick={() => moderateReview(review.id, "published")} disabled={moderate.isPending}><Check className="size-4" />{t.publish}</Button>}
                {review.state !== "hidden" && review.state !== "removed" && <Button size="sm" variant="outline" onClick={() => moderateReview(review.id, "hidden")} disabled={moderate.isPending}><EyeOff className="size-4" />{t.hide}</Button>}
                {review.state !== "removed" && <Button size="sm" variant="destructive" onClick={() => moderateReview(review.id, "removed")} disabled={moderate.isPending}><Trash2 className="size-4" />{t.remove}</Button>}
                {review.state === "removed" && isSuperAdmin && <Button size="sm" variant="outline" onClick={() => restoreReview(review.id)} disabled={restore.isPending}><RotateCcw className="size-4" />{t.restore}</Button>}
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6">{review.text || <span className="italic text-muted-foreground">{t.noText}</span>}</p>
            {review.moderationHistory && review.moderationHistory.length > 0 && <details className="rounded-lg bg-muted/50 p-3 text-xs"><summary className="cursor-pointer font-medium">{t.history} ({review.moderationHistory.length})</summary><div className="mt-2 space-y-2">{review.moderationHistory.map((event, index) => <div key={`${event.at}-${index}`} className="flex flex-wrap justify-between gap-2"><span>{event.from} → {event.to} · {event.actorRole}{event.reason ? ` — ${event.reason}` : ""}</span><span className="text-muted-foreground">{formatDate(event.at)}</span></div>)}</div></details>}
            {review.state === "removed" && isSuperAdmin && <p className="text-xs text-muted-foreground">{t.restoreHint}</p>}
          </article>)}
        </div>}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <Button size="sm" variant="outline" disabled={cursorStack.length === 0 || query.isFetching} onClick={() => setCursorStack((items) => items.slice(0, -1))}><ChevronLeft className="size-4" />{t.previous}</Button>
          <span className="text-xs text-muted-foreground">{cursorStack.length + 1}</span>
          <Button size="sm" variant="outline" disabled={!query.data?.nextCursor || query.isFetching} onClick={() => { if (query.data?.nextCursor) setCursorStack((items) => [...items, query.data!.nextCursor!]); }} >{t.next}<ChevronRight className="size-4" /></Button>
        </div>
      </section>
    </div>
  );
}
