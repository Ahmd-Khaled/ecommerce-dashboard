"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight, CreditCard, Eye, Loader2, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "./payment-status-badge";
import { PaymentOrderDetailsDialog } from "./payment-order-details-dialog";
import { usePaymentOrders } from "../hooks/use-payment-management";
import type { OrderStatus, PaymentOrder } from "../types/payment.types";

const PAGE_SIZE = 10;
const statuses: OrderStatus[] = ["placed", "processing", "shipped", "delivered", "cancelled"];
const dateStart = (value: string) => value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
const dateEnd = (value: string) => value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;
function amount(order: PaymentOrder, locale: string) {
  if (order.schemaVersion === 1 || !order.currency || order.grandTotalMinor === undefined || order.currencyExponent === undefined) return "—";
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", { style: "currency", currency: order.currency, maximumFractionDigits: order.currencyExponent, minimumFractionDigits: order.currencyExponent }).format(order.grandTotalMinor / 10 ** order.currencyExponent);
}

export default function PaymentsPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<PaymentOrder | null>(null);
  const params = useMemo(() => ({ page, limit: PAGE_SIZE, ...(status !== "all" ? { status } : {}), ...(from ? { from: dateStart(from) } : {}), ...(to ? { to: dateEnd(to) } : {}) }), [page, status, from, to]);
  const query = usePaymentOrders(params);
  const orders = query.data?.orders ?? [];
  const pagination = query.data?.pagination;
  const text = ar ? {
    title: "إدارة المدفوعات", subtitle: "راجع حالات الدفع المرتبطة بالطلبات المسجلة.", orderStatus: "حالة الطلب", all: "كل الحالات", from: "من تاريخ", to: "إلى تاريخ", order: "الطلب", customer: "العميل", amount: "المبلغ", payment: "حالة الدفع", date: "التاريخ", actions: "الإجراءات", view: "التفاصيل", loading: "جارٍ تحميل المدفوعات...", error: "تعذر تحميل بيانات المدفوعات.", retry: "إعادة المحاولة", empty: "لا توجد طلبات تطابق الفلاتر المحددة.", page: "صفحة", of: "من", previous: "السابق", next: "التالي", note: "تعتمد البيانات على واجهة الطلبات الإدارية الحالية. لا يتوفر فلتر عام لحالة الدفع أو معرف جلسة Stripe أو إجراءات الدفع والاسترداد الإدارية."
  } : {
    title: "Payments Management", subtitle: "Review payment statuses recorded against customer orders.", orderStatus: "Order status", all: "All statuses", from: "From date", to: "To date", order: "Order", customer: "Customer", amount: "Amount", payment: "Payment status", date: "Created", actions: "Actions", view: "Details", loading: "Loading payment records...", error: "Unable to load payment records.", retry: "Try again", empty: "No orders match the selected filters.", page: "Page", of: "of", previous: "Previous", next: "Next", note: "Data is read from the existing admin orders API. A global payment-status filter, Stripe session references, and admin payment or refund actions are not available."
  };

  return <div className="space-y-6 pb-8">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><CreditCard className="size-5" /></div><h1 className="text-2xl font-bold tracking-tight">{text.title}</h1></div><p className="mt-2 text-sm text-muted-foreground">{text.subtitle}</p></div><Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} />{ar ? "تحديث" : "Refresh"}</Button></header>
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-3"><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{text.orderStatus}</span><select value={status} onChange={(e) => { setStatus(e.target.value as "all" | OrderStatus); setPage(1); }} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"><option value="all">{text.all}</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{text.from}</span><span className="relative block"><CalendarDays className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${ar ? "right-3" : "left-3"}`} /><input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={`h-10 w-full rounded-xl border border-input bg-background text-sm outline-none focus:border-primary ${ar ? "pr-9 pl-3" : "pl-9 pr-3"}`} /></span></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{text.to}</span><span className="relative block"><CalendarDays className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${ar ? "right-3" : "left-3"}`} /><input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={`h-10 w-full rounded-xl border border-input bg-background text-sm outline-none focus:border-primary ${ar ? "pr-9 pl-3" : "pl-9 pr-3"}`} /></span></label></div></section>
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="font-semibold">{ar ? "سجل المدفوعات" : "Payment records"}</h2><p className="mt-1 text-xs text-muted-foreground">{pagination?.total ?? 0} {ar ? "طلب" : "orders"}</p></div>{query.isFetching && !query.isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="border-b border-border bg-muted/40"><tr className="text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">{[text.order, text.customer, text.amount, text.payment, text.orderStatus, text.date, text.actions].map((v) => <th key={v} className="px-5 py-4">{v}</th>)}</tr></thead><tbody className="divide-y divide-border">
        {query.isLoading ? <tr><td colSpan={7} className="px-5 py-14 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">{text.loading}</p></td></tr> : query.isError ? <tr><td colSpan={7} className="px-5 py-14 text-center"><p className="text-sm text-destructive">{text.error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>{text.retry}</Button></td></tr> : orders.length === 0 ? <tr><td colSpan={7} className="px-5 py-14 text-center"><SearchX className="mx-auto size-6 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">{text.empty}</p></td></tr> : orders.map((order) => <tr key={order._id} className="transition-colors hover:bg-muted/30"><td className="px-5 py-4"><span className="font-mono text-xs font-semibold">#{order._id.slice(-8).toUpperCase()}</span><p className="mt-1 text-[11px] text-muted-foreground">{order.schemaVersion === 1 ? "Legacy order" : "Order v2"}</p></td><td className="px-5 py-4"><span className="font-mono text-xs text-muted-foreground">{order.user}</span></td><td className="px-5 py-4 font-semibold">{amount(order, locale)}</td><td className="px-5 py-4"><PaymentStatusBadge status={order.paymentStatus} isArabic={ar} /></td><td className="px-5 py-4"><span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium capitalize">{order.status}</span></td><td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(locale)}</td><td className="px-5 py-4 text-end"><Button variant="ghost" size="sm" onClick={() => setSelected(order)}><Eye className="size-4" />{text.view}</Button></td></tr>)}
      </tbody></table></div><footer className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{text.page} {pagination?.page ?? page} {text.of} {Math.max(1, pagination?.totalPages ?? 1)}</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1 || query.isFetching} onClick={() => setPage((v) => Math.max(1, v - 1))}>{ar ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}{text.previous}</Button><Button variant="outline" size="sm" disabled={page >= (pagination?.totalPages ?? 1) || query.isFetching} onClick={() => setPage((v) => v + 1)}>{text.next}{ar ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}</Button></div></footer></section>
    <p className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-xs leading-5 text-muted-foreground">{text.note}</p>
    {selected && <PaymentOrderDetailsDialog order={selected} onClose={() => setSelected(null)} />}
  </div>;
}
