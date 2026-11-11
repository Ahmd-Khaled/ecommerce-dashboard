"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { apiErrorMessage } from "@/lib/api/axios";

import { usePaymentOrders } from "../hooks/use-payments";
import { PaymentStatusBadge } from "./payment-status-badge";
import { PaymentDetailsDialog } from "./payment-details-dialog";
import type {
  OrderStatus,
  PaymentOrder,
  PaymentOrdersParams,
  PaymentStatus,
} from "../types/payment.types";

const PAGE_SIZE = 20;

type PaymentStatusFilter = PaymentStatus | "all";

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAmount(order: PaymentOrder, locale: string) {
  if (
    order.schemaVersion !== 2 ||
    !order.currency ||
    typeof order.grandTotalMinor !== "number"
  ) {
    return typeof order.total === "number"
      ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG").format(
          order.total,
        )
      : "—";
  }

  const exponent = order.currencyExponent ?? 2;

  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: order.currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(order.grandTotalMinor / 10 ** exponent);
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-3 pt-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>

        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentsPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("PaymentsManagement");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const params = useMemo<PaymentOrdersParams>(() => {
    const from = fromDate
      ? new Date(`${fromDate}T00:00:00`).toISOString()
      : undefined;

    const to = toDate
      ? new Date(`${toDate}T23:59:59.999`).toISOString()
      : undefined;

    return {
      page,
      limit: PAGE_SIZE,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
  }, [page, fromDate, toDate]);

  const ordersQuery = usePaymentOrders(params);
  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;

  // The backend currently supports date filters, but not payment-status
  // or text filters. These two filters apply to the loaded page only.
  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        paymentStatus === "all" ||
        (!order.legacy && order.paymentStatus === paymentStatus);

      const matchesSearch =
        !normalizedSearch ||
        order._id.toLowerCase().includes(normalizedSearch) ||
        order.user.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [orders, paymentStatus, search]);

  const counts = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        result.total += 1;

        if (order.legacy) return result;

        result[order.paymentStatus] += 1;

        return result;
      },
      {
        total: 0,
        unpaid: 0,
        pending: 0,
        paid: 0,
        expired: 0,
      },
    );
  }, [orders]);

  const statusLabels: Record<PaymentStatus, string> = {
    unpaid: t("paymentStatuses.unpaid"),
    pending: t("paymentStatuses.pending"),
    paid: t("paymentStatuses.paid"),
    expired: t("paymentStatuses.expired"),
  };

  const orderStatusLabels: Record<OrderStatus, string> = {
    placed: t("orderStatuses.placed"),
    processing: t("orderStatuses.processing"),
    shipped: t("orderStatuses.shipped"),
    delivered: t("orderStatuses.delivered"),
    cancelled: t("orderStatuses.cancelled"),
  };

  function clearFilters() {
    setSearch("");
    setPaymentStatus("all");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  const hasFilters = Boolean(
    search || paymentStatus !== "all" || fromDate || toDate,
  );

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => void ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
        >
          <RefreshCw
            className={`size-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label={t("summary.loadedOrders")}
          value={counts.total}
          icon={CreditCard}
          tone="bg-primary/10 text-primary"
        />

        <SummaryCard
          label={t("paymentStatuses.paid")}
          value={counts.paid}
          icon={CheckCircle2}
          tone="bg-emerald-500/10 text-emerald-600"
        />

        <SummaryCard
          label={t("paymentStatuses.pending")}
          value={counts.pending}
          icon={Clock3}
          tone="bg-amber-500/10 text-amber-600"
        />

        <SummaryCard
          label={t("paymentStatuses.unpaid")}
          value={counts.unpaid}
          icon={CircleDollarSign}
          tone="bg-slate-500/10 text-slate-600"
        />

        <SummaryCard
          label={t("paymentStatuses.expired")}
          value={counts.expired}
          icon={XCircle}
          tone="bg-rose-500/10 text-rose-600"
        />
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                className={`absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${
                  isArabic ? "right-3" : "left-3"
                }`}
              />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("filters.searchPlaceholder")}
                className={isArabic ? "pr-9" : "pl-9"}
              />
            </div>

            <select
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(event.target.value as PaymentStatusFilter)
              }
              className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={t("filters.paymentStatus")}
            >
              <option value="all">{t("filters.allPaymentStatuses")}</option>
              <option value="paid">{statusLabels.paid}</option>
              <option value="pending">{statusLabels.pending}</option>
              <option value="unpaid">{statusLabels.unpaid}</option>
              <option value="expired">{statusLabels.expired}</option>
            </select>

            <div className="relative">
              <CalendarDays
                className={`absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${
                  isArabic ? "right-3" : "left-3"
                }`}
              />

              <Input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
                aria-label={t("filters.fromDate")}
                className={isArabic ? "pr-9" : "pl-9"}
              />
            </div>

            <div className="relative">
              <CalendarDays
                className={`absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${
                  isArabic ? "right-3" : "left-3"
                }`}
              />

              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
                aria-label={t("filters.toDate")}
                className={isArabic ? "pr-9" : "pl-9"}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {t("filters.pageOnlyNote")}
            </p>

            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                {t("filters.clear")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
          <div>
            <h2 className="text-sm font-semibold">{t("table.title")}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {pagination?.total ?? 0} {t("table.totalOrders")}
            </p>
          </div>

          {ordersQuery.isFetching && !ordersQuery.isLoading && (
            <Badge variant="secondary">{t("updating")}</Badge>
          )}
        </div>

        {ordersQuery.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : ordersQuery.isError ? (
          <div className="m-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              {t("errors.loadFailed")}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {apiErrorMessage(ordersQuery.error)}
            </p>

            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => void ordersQuery.refetch()}
            >
              {t("retry")}
            </Button>
          </div>
        ) : (
          <>
            <div
              className={`mt-3 ${ordersQuery.isFetching ? "opacity-60" : ""}`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("fields.order")}</TableHead>
                    <TableHead>{t("fields.customer")}</TableHead>
                    <TableHead>{t("fields.paymentStatus")}</TableHead>
                    <TableHead>{t("fields.orderStatus")}</TableHead>
                    <TableHead>{t("fields.amount")}</TableHead>
                    <TableHead>{t("fields.createdAt")}</TableHead>
                    <TableHead className="text-end">
                      {t("fields.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-sm text-muted-foreground"
                      >
                        {t("empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <span className="font-mono text-xs font-medium">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>

                          {order.legacy && (
                            <span className="mt-1 block text-[11px] text-orange-600">
                              {t("paymentStatuses.legacy")}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span
                            className="block max-w-36 truncate font-mono text-xs"
                            title={order.user}
                          >
                            {order.user}
                          </span>
                        </TableCell>

                        <TableCell>
                          <PaymentStatusBadge
                            status={order.paymentStatus}
                            legacy={order.legacy}
                            labels={{
                              ...statusLabels,
                              legacy: t("paymentStatuses.legacy"),
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {orderStatusLabels[order.status]}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-semibold tabular-nums">
                          {formatAmount(order, locale)}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt, locale)}
                        </TableCell>

                        <TableCell className="text-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrderId(order._id)}
                          >
                            <Eye className="size-3.5" />
                            {t("actions.view")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t("pagination.page")} {pagination?.page ?? page}{" "}
                {t("pagination.of")} {pagination?.totalPages ?? 1}
                {" · "}
                {t("pagination.total")}: {pagination?.total ?? 0}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || ordersQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  {isArabic ? (
                    <ChevronRight className="size-4" />
                  ) : (
                    <ChevronLeft className="size-4" />
                  )}
                  {t("pagination.previous")}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= (pagination?.totalPages ?? 1) ||
                    ordersQuery.isFetching
                  }
                  onClick={() => setPage((current) => current + 1)}
                >
                  {t("pagination.next")}
                  {isArabic ? (
                    <ChevronLeft className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <PaymentDetailsDialog
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
