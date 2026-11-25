"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import axios from "axios";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Pause, Play, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogFilters as LogFiltersForm } from "./log-filters";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAdminAuth } from "@/features/admin-auth/hooks/use-admin-auth";
import { getRequestId } from "@/lib/api/request-id";
import { getLogCooldown, systemLogsApi } from "../api/system-logs.api";
import { logFiltersSchema } from "../schemas/system-log.schema";
import type { LogFilters, LogPage, LogStatistics, SystemLog } from "../types/system-log.types";

// Component-local results are discarded on identity change, permission loss and unmount.
export function SystemLogsPage() {
  const { admin, isSuperAdmin, status } = useAdminAuth();
  return status === "authenticated" && isSuperAdmin && admin
    ? <LogSession key={admin._id} /> : null;
}

function LogSession() {
  const ar = useLocale() === "ar";
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    const stop = () => setDenied(true);
    window.addEventListener("system-logs-forbidden", stop);
    return () => window.removeEventListener("system-logs-forbidden", stop);
  }, []);
  if (denied) return <div role="alert" className="m-8 rounded-xl border p-6">{ar ? "تم رفض الوصول. سجلات النظام متاحة للمسؤول الرئيسي النشط فقط." : "Access denied. System logs require an active Super Admin account."}</div>;
  return <LogWorkspace />;
}

type Result<T> = { data?: T; error?: unknown; loading: boolean; updatedAt?: string };
function useRead<T>(read: (signal: AbortSignal) => Promise<T>, dependencies: unknown[]): Result<T> {
  const requestKey = JSON.stringify(dependencies);
  const [result, setResult] = useState<Result<T> & { requestKey?: string }>({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    read(controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ data, loading: false, updatedAt: new Date().toISOString(), requestKey });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ error, loading: false, requestKey });
    });
    return () => controller.abort();
    // Callers explicitly provide the complete request identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);
  // Never render a previous page's rows/cursor under a new request identity,
  // including the render before the effect clears its state.
  return result.requestKey === requestKey ? result : { loading: true };
}
const tones = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  failure: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  denied: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  aborted: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
};
const methodTones: Record<string, string> = {
  GET: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  POST: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PUT: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  PATCH: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  DELETE: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function LogWorkspace() {
  const locale = useLocale();
  const ar = locale === "ar";
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const [draft, setDraft] = useState<Record<string, string>>({ range: "24", limit: "25" });
  const [filters, setFilters] = useState<LogFilters>(() => {
    const now = Date.now();
    return { limit: 25, from: new Date(now - 86400000).toISOString(), to: new Date(now).toISOString() };
  });
  const [appliedRange, setAppliedRange] = useState("24");
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const [revision, setRevision] = useState(0);
  const [validation, setValidation] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [refreshSeconds, setRefreshSeconds] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setCooldown(getLogCooldown()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      if (refreshSeconds <= 1) {
        if (getLogCooldown() === 0) refresh(true);
        else setRefreshSeconds(30);
      } else setRefreshSeconds(seconds => seconds - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
    // The countdown drives refreshes and preserves the current pagination cursor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshSeconds, cooldown, appliedRange, filters, cursors]);
  useEffect(() => {
    const resumeCountdown = () => {
      if (document.visibilityState === "visible" && autoRefresh) setRefreshSeconds(30);
    };
    document.addEventListener("visibilitychange", resumeCountdown);
    return () => document.removeEventListener("visibilitychange", resumeCountdown);
  }, [autoRefresh]);
  const after = cursors.at(-1);
  const list = useRead<LogPage>(signal => systemLogsApi.list(filters, after, signal), [filters, after, revision]);
  const stats = useRead<LogStatistics>(signal => systemLogsApi.statistics(filters, signal), [filters.from, filters.to, filters.method, filters.route, revision]);
  const set = (key: string, value: string) => setDraft(old => ({ ...old, [key]: value }));
  const number = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n);
  const date = (value: string) => new Date(value).toLocaleString(locale);
  const outcome = (value: SystemLog["outcome"]) => ({ success: t("Success", "ناجح"), failure: t("Failure", "فشل"), denied: t("Denied", "مرفوض"), aborted: t("Aborted", "منقطع") })[value];

  function apply(reset = false) {
    if (getLogCooldown()) return;
    const d = reset ? { range: "24", limit: "25" } as Record<string, string> : draft;
    const next: LogFilters = { limit: Number(d.limit || 25) };
    if ((d.minDurationMs && (!/^\d+$/.test(d.minDurationMs) || Number(d.minDurationMs) > 2147483647)) ||
      (d.status && !/^([1-5]\d{2}|[1-5]xx)$/.test(d.status))) {
      setValidation(t("Use decimal digits only for duration and a valid HTTP status or group.", "استخدم أرقاماً صحيحة للمدة ورمز حالة HTTP أو مجموعة صحيحة.")); return;
    }
    const now = new Date();
    if (d.range === "custom") {
      if (!d.from || !d.to || !Number.isFinite(Date.parse(d.from)) || !Number.isFinite(Date.parse(d.to)) || new Date(d.from) >= new Date(d.to) || new Date(d.to) > now) {
        setValidation(t("Choose a valid start and end time, ending no later than now.", "اختر بداية ونهاية صحيحتين لا تتجاوزان الوقت الحالي.")); return;
      }
      next.from = new Date(d.from).toISOString(); next.to = new Date(d.to).toISOString();
    } else {
      next.to = now.toISOString(); next.from = new Date(now.getTime() - Number(d.range) * 3600000).toISOString();
    }
    for (const key of ["requestId", "method", "route", "outcome", "minDurationMs"] as const) {
      if (d[key]?.trim()) next[key] = d[key].trim();
    }
    if (d.status) { if (d.status.endsWith("xx")) next.statusGroup = d.status; else next.statusCode = d.status; }
    if (next.requestId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(next.requestId)) {
      setValidation(t("Request ID must be a UUID.", "يجب أن يكون معرّف الطلب UUID.")); return;
    }
    if (!logFiltersSchema.safeParse(next).success) {
      setValidation(t("Check the request UUID, route length, and numeric filter limits.", "تحقق من معرّف الطلب وطول المسار وحدود عوامل التصفية الرقمية.")); return;
    }
    setValidation(""); setCursors([undefined]); setSelected(null); setFilters(next); setAppliedRange(d.range);
    if (reset) setDraft(d);
  }
  function refresh(preservePage = false) {
    if (getLogCooldown()) return;
    setRefreshSeconds(30);
    if (!preservePage) setCursors([undefined]);
    setSelected(null);
    if (appliedRange !== "custom") {
      const now = Date.now();
      setFilters(old => ({ ...old, from: new Date(now - Number(appliedRange) * 3600000).toISOString(), to: new Date(now).toISOString() }));
    } else setRevision(v => v + 1);
  }
  function errorBox(error: unknown, retry: () => void) {
    const status = axios.isAxiosError(error) ? (error.code === "RATE_LIMITED" ? 429 : error.response?.status) : undefined;
    const messages: Record<number, string> = {
      400: t("The filters or cursor are invalid or expired. Adjust the time range or restart from the first page.", "عوامل التصفية أو مؤشر الصفحة غير صالح أو منتهي. عدّل الفترة أو ابدأ من الصفحة الأولى."),
      401: t("Your session has expired. Sign in again.", "انتهت الجلسة. سجّل الدخول مجدداً."),
      403: t("System logs are available to active super admins only.", "السجلات متاحة للمسؤول الرئيسي النشط فقط."),
      404: t("This record or endpoint is unavailable. The record may have expired.", "السجل أو الخدمة غير متاح. ربما انتهت مدة الاحتفاظ بالسجل."),
      429: t("Request limit reached. Wait a minute before trying again.", "تم بلوغ حد الطلبات. انتظر دقيقة ثم حاول مجدداً."),
      503: t("System logs are temporarily unavailable or disabled on this backend.", "سجلات النظام غير متاحة مؤقتاً أو غير مفعّلة في الخادم."),
    };
    return <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"><p className="font-medium">{(axios.isAxiosError(error) && error.code === "INVALID_RESPONSE" ? t("The server returned an unreadable response.", "أعاد الخادم استجابة غير قابلة للقراءة.") : messages[status || 0]) || t("Could not connect to system logs. Please try again.", "تعذّر الاتصال بسجلات النظام. حاول مجدداً.")}</p>{getRequestId(error) && <p className="mt-2 break-all font-mono text-sm" dir="ltr">Reference: {getRequestId(error)}</p>}<Button variant="outline" className="mt-3" disabled={cooldown > 0 || status === 403 || status === 401} onClick={retry}>{t("Try again / first page", "إعادة المحاولة / الصفحة الأولى")}</Button></div>;
  }
  const s = stats.data;
  const cards = [
    { label: t("Total requests", "إجمالي الطلبات"), value: s && number(s.totalRequests), hint: t("Stored request events", "أحداث الطلبات المخزنة"), Icon: Activity, color: "text-primary bg-primary/10" },
    { label: t("Successful", "الناجحة"), value: s && number(s.successfulRequests), hint: s ? `${s.totalRequests ? number(s.successfulRequests / s.totalRequests * 100) : "0"}% ${t("success rate", "نسبة النجاح")}` : "", Icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10" },
    { label: t("Unsuccessful", "غير الناجحة"), value: s && number(s.failedRequests), hint: t("Includes denied and aborted", "تشمل المرفوضة والمنقطعة"), Icon: AlertTriangle, color: "text-rose-600 bg-rose-500/10" },
    { label: t("P95 latency", "زمن الاستجابة P95"), value: s && (s.totalRequests ? `${number(s.p95DurationMs)} ms` : t("No data", "لا توجد بيانات")), hint: t("Approximate 95th percentile", "المئين 95 التقريبي"), Icon: Clock3, color: "text-violet-600 bg-violet-500/10" },
  ];
  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 md:space-y-5 md:p-8" dir={ar ? "rtl" : "ltr"}>
    <div className="fixed bottom-5 end-5 z-40 flex items-center gap-2 rounded-full border border-border/80 bg-card/95 p-1.5 shadow-lg backdrop-blur" role="group" aria-label={t("Auto refresh controls", "Auto refresh controls")}>
      <div className="relative grid size-10 place-items-center rounded-full" role="timer" aria-label={autoRefresh ? t(`Refreshes in ${refreshSeconds} seconds`, `يُحدّث خلال ${refreshSeconds} ثانية`) : t("Auto refresh paused", "التحديث التلقائي متوقف")} style={{ background: `conic-gradient(var(--primary) ${autoRefresh ? ((30 - refreshSeconds) / 30) * 360 : 0}deg, var(--muted) 0deg)` }}>
        <div className="absolute inset-[3px] rounded-full bg-card" />
        <span key={`${autoRefresh}-${refreshSeconds}`} className="relative z-10 text-xs font-semibold tabular-nums animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">{refreshSeconds}</span>
      </div>
      <Button type="button" size="icon" variant="ghost" className="size-9 rounded-full" aria-label={autoRefresh ? t("Pause auto refresh", "إيقاف التحديث التلقائي") : t("Start auto refresh", "بدء التحديث التلقائي")} title={autoRefresh ? t("Pause auto refresh", "إيقاف التحديث التلقائي") : t("Start auto refresh", "بدء التحديث التلقائي")} onClick={() => setAutoRefresh(running => !running)}>{autoRefresh ? <Pause className="size-4" /> : <Play className="size-4" />}</Button>
    </div>
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border bg-card px-5 py-4 shadow-sm md:px-6">
      <div className="min-w-0"><div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"><ShieldCheck className="size-3.5" />{t("System observability", "مراقبة النظام")}</div><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h1 className="text-2xl font-semibold tracking-tight">{t("System logs", "سجلات النظام")}</h1><p className="text-sm text-muted-foreground">{t("Trace requests, investigate failures, and understand response times.", "تتبع الطلبات وافحص الأخطاء وراقب أوقات الاستجابة.")}</p></div><div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"><span>{t("Timezone", "المنطقة الزمنية")}: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>{list.updatedAt && <><span aria-hidden="true">·</span><span>{t("Updated", "آخر تحديث")}: {date(list.updatedAt)}</span></>}</div></div>
      <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={() => refresh()} disabled={cooldown > 0 || list.loading || stats.loading}><RefreshCw className={list.loading ? "size-4 animate-spin" : "size-4"} />{t("Refresh", "تحديث")}</Button>
    </header>
    {cooldown > 0 && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">{t("Requests paused. Retry in", "الطلبات متوقفة. أعد المحاولة بعد")} {cooldown} {t("seconds", "ثانية")}</p>}
    <section aria-label={t("Request statistics", "إحصائيات الطلبات")} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><h2 className="text-base font-semibold tracking-tight">{t("Request overview", "نظرة عامة على الطلبات")}</h2><p className="text-xs text-muted-foreground">{t("Statistics use time range, method and route only", "الإحصائيات حسب الفترة والطريقة والمسار فقط")}</p></div>
      {s && <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-label={t("Response time", "زمن الاستجابة")} className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{t("Response time", "زمن الاستجابة")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("Latency distribution across requests", "توزيع زمن الاستجابة للطلبات")}</p></div><Clock3 className="size-5 text-violet-600" /></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[t("Average", "المتوسط"), s.averageDurationMs], ["P50", s.p50DurationMs], ["P99", s.p99DurationMs], [t("Maximum", "الأقصى"), s.maxDurationMs]].map(([label, value], index) => <div key={label} className={`rounded-xl p-3 ${index === 2 ? "bg-amber-500/10" : "bg-muted/50"}`}><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 whitespace-nowrap text-lg font-semibold tabular-nums">{s.totalRequests ? number(Number(value)) : "—"}<span className="ms-1 text-xs font-normal text-muted-foreground">ms</span></p></div>)}</div>
        </section>
        <section aria-label={t("Request signals", "مؤشرات الطلبات")} className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{t("Request signals", "مؤشرات الطلبات")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("Slow requests and non-success outcomes", "الطلبات البطيئة والنتائج غير الناجحة")}</p></div><AlertTriangle className="size-5 text-amber-600" /></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{[[t("Slow ≥ 1 s", "بطيئة ≥ ثانية"), s.slowRequests, "text-amber-700 dark:text-amber-300"], ["4xx", s.clientErrorRequests, "text-orange-700 dark:text-orange-300"], ["5xx", s.serverErrorRequests, "text-rose-700 dark:text-rose-300"], [t("Denied", "مرفوضة"), s.deniedRequests, "text-amber-700 dark:text-amber-300"], [t("Aborted", "منقطعة"), s.abortedRequests, "text-violet-700 dark:text-violet-300"]].map(([label, value, color]) => <div key={label} className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className={`mt-2 text-xl font-semibold tabular-nums ${color}`}>{number(Number(value))}</p></div>)}</div>
        </section>
      </div>}
      {s && <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><p className="min-w-0 text-sm font-medium tabular-nums"><span className="text-muted-foreground">{t("Time range", "النطاق الزمني")}</span><span className="mx-2 text-muted-foreground">·</span><span dir="auto">{date(s.from)} — {date(s.to)}</span></p></div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground sm:max-w-md sm:justify-end"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" /><span>{t("Local time · Stored diagnostics may be incomplete; this is not an audit trail.", "التوقيت المحلي · قد تكون البيانات التشخيصية غير مكتملة؛ وهذه ليست سجلًا للتدقيق.")}</span></p>
      </div>}
    </section>
    <LogFiltersForm draft={draft} onChange={set} onApply={() => apply()} onReset={() => apply(true)} disabled={cooldown > 0} validation={validation} />
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm" aria-busy={list.loading}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h2 className="text-lg font-semibold tracking-tight">{t("Request stream", "سجل الطلبات")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("Newest first · Select a request to inspect its details", "الأحدث أولًا · اختر طلبًا لعرض تفاصيله")}</p></div><div className="flex items-center gap-2"><Badge variant="secondary" className="tabular-nums">{t("Page", "صفحة")} {cursors.length}</Badge><Button type="button" variant="outline" size="icon" className="size-8" aria-label={t("Refresh request table", "تحديث جدول الطلبات")} title={t("Refresh request table", "تحديث جدول الطلبات")} onClick={() => refresh(true)} disabled={cooldown > 0 || list.loading}><RefreshCw className={list.loading ? "size-3.5 animate-spin" : "size-3.5"} /></Button></div></div>
      {list.loading ? <div role="status" className="space-y-3 p-6"><span className="sr-only">{t("Loading requests", "جارٍ تحميل الطلبات")}</span>{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div> : list.error ? <div className="p-5">{errorBox(list.error, refresh)}</div> : !list.data?.items.length ? <div className="px-5 py-16 text-center"><Search className="mx-auto mb-4 size-9 text-muted-foreground" /><h3 className="font-semibold">{t("No matching requests", "لا توجد طلبات مطابقة")}</h3><p className="mt-2 text-muted-foreground">{t("Try a wider time range or remove a filter.", "جرّب فترة أوسع أو احذف أحد عوامل التصفية.")}</p></div> : <div className="overflow-x-auto"><table className="w-full text-start text-sm"><thead className="bg-muted/40 text-muted-foreground"><tr>{[t("Time", "الوقت"), t("Request", "الطلب"), t("Status", "الحالة"), t("Outcome", "النتيجة"), t("Duration", "المدة"), t("Request ID", "معرّف الطلب")].map(h => <th key={h} className="px-5 py-3 text-start font-medium">{h}</th>)}</tr></thead><tbody className="divide-y">{list.data.items.map(row => <tr key={row.logId} className="hover:bg-muted/30"><td className="whitespace-nowrap px-5 py-4 tabular-nums">{date(row.occurredAt)}</td><td className="px-5 py-4"><button disabled={cooldown > 0} onClick={() => setSelected(row.logId)} className="flex items-center gap-3 rounded text-start focus-visible:outline-2 focus-visible:outline-ring"><Badge variant="outline" className={`font-mono font-semibold ${methodTones[row.http.method] ?? "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300"}`}>{row.http.method}</Badge><span dir="ltr" className="max-w-64 truncate font-mono text-primary underline-offset-4 hover:underline" title={row.http.route}>{row.http.route}</span><span className="sr-only">{t("View details", "عرض التفاصيل")}</span></button></td><td className="px-5 py-4 font-mono">{row.http.statusCode}</td><td className="px-5 py-4"><Badge className={tones[row.outcome]}>{outcome(row.outcome)}</Badge>{!row.http.completed && <span className="mt-1 block text-xs text-muted-foreground">{t("Incomplete response", "استجابة غير مكتملة")}</span>}</td><td className="whitespace-nowrap px-5 py-4 font-mono">{number(row.http.durationMs)} ms</td><td className="px-5 py-4"><span dir="ltr" title={row.requestId} className="block max-w-36 truncate font-mono text-muted-foreground select-all">{row.requestId}</span></td></tr>)}</tbody></table></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4"><p className="text-sm text-muted-foreground">{list.data ? `${number(list.data.items.length)} ${t("requests on this page", "طلب في هذه الصفحة")}` : "—"}</p><div className="flex gap-2"><Button variant="outline" disabled={cooldown > 0 || cursors.length === 1 || list.loading} onClick={() => setCursors(c => c.slice(0, -1))}>{t("Previous", "السابق")}</Button><Button variant="outline" disabled={cooldown > 0 || list.loading || !list.data?.pageInfo.hasNextPage || !list.data.pageInfo.nextCursor} onClick={() => { const cursor = list.data?.pageInfo.nextCursor; if (cursor) setCursors(c => [...c, cursor]); }}>{t("Next", "التالي")}</Button></div></div>
    </section>
    <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}><SheetContent side={ar ? "left" : "right"} className="overflow-y-auto sm:max-w-xl" dir={ar ? "rtl" : "ltr"}><SheetHeader><SheetTitle>{t("Request details", "تفاصيل الطلب")}</SheetTitle><SheetDescription>{t("Sanitized server diagnostics", "بيانات تشخيصية آمنة من الخادم")}</SheetDescription></SheetHeader>{selected && <LogDetail key={selected} id={selected} ar={ar} errorBox={errorBox} refreshList={refresh} />}</SheetContent></Sheet>
  </div>;
}

function CopyId({ value, label, ar }: { value: string; label: string; ar: boolean }) {
  const [message, setMessage] = useState("");
  return <span className="mt-2 flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" aria-label={`${ar ? "نسخ" : "Copy"} ${label}`} onClick={async () => {
    try { await navigator.clipboard.writeText(value); setMessage(ar ? "تم النسخ" : "Copied"); }
    catch { setMessage(ar ? "تعذّر النسخ. حدّد النص وانسخه يدوياً." : "Copy unavailable. Select and copy the text manually."); }
  }}>{ar ? "نسخ" : "Copy"}</Button><span role="status" className="text-sm text-muted-foreground">{message}</span></span>;
}

function LogDetail({ id, ar, errorBox, refreshList }: { id: string; ar: boolean; errorBox: (error: unknown, retry: () => void) => ReactNode; refreshList: () => void }) {
  const [revision, setRevision] = useState(0);
  const result = useRead(signal => systemLogsApi.detail(id, signal), [id, revision]);
  const t = (en: string, arabic: string) => ar ? arabic : en;
  if (result.loading) return <p role="status" className="p-5">{t("Loading details…", "جارٍ تحميل التفاصيل…")}</p>;
  if (axios.isAxiosError(result.error) && result.error.response?.status === 404) return <div role="status" className="space-y-4 p-5"><p>{t("This log is no longer available.", "هذا السجل لم يعد متاحاً.")}</p><Button variant="outline" onClick={refreshList}>{t("Refresh list", "تحديث القائمة")}</Button></div>;
  if (result.error) return <div className="p-5">{errorBox(result.error, () => setRevision(v => v + 1))}</div>;
  const log = result.data;
  if (!log) return null;
  const fields = [
    [t("Request ID", "معرّف الطلب"), log.requestId], [t("Log ID", "معرّف السجل"), log.logId],
    [t("Occurred at (UTC)", "الوقت (UTC)"), log.occurredAt], [t("Method", "الطريقة"), log.http.method],
    [t("Route template", "قالب المسار"), log.http.route], [t("HTTP status", "حالة HTTP"), log.http.statusCode],
    [t("Outcome", "النتيجة"), log.outcome], [t("Completed", "مكتمل"), log.http.completed ? t("Yes", "نعم") : t("No", "لا")],
    [t("Duration", "المدة"), `${log.http.durationMs} ms`], [t("Service", "الخدمة"), log.service],
    [t("Environment", "البيئة"), log.environment], [t("Level", "المستوى"), log.level],
    [t("Actor type", "نوع المنفّذ"), log.actor.type], [t("Actor ID", "معرّف المنفّذ"), log.actor.id],
    [t("Identity model", "نموذج الهوية"), log.actor.identityModel], [t("Role", "الدور"), log.actor.role],
    [t("Error code", "رمز الخطأ"), log.error?.code], [t("Action", "الإجراء"), log.action],
    [t("Kind", "النوع"), log.kind], [t("Schema version", "إصدار المخطط"), log.schemaVersion],
  ];
  return <dl className="divide-y px-5 pb-6">{fields.map(([label, value], index) => <div key={String(label)} className="py-3"><dt className="text-sm text-muted-foreground">{label}</dt><dd dir="auto" className="mt-1 break-all font-mono text-sm select-all">{value ?? "—"}{index < 2 && <CopyId value={String(value)} label={String(label)} ar={ar} />}</dd></div>)}</dl>;
}
