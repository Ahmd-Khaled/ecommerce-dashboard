"use client";

import { useMemo, useState } from "react";

import {
  CalendarDays,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useOrders, useUpdateOrderStatus } from "../hooks/use-orders";

import {
  type Order,
  type OrderFilters,
  type OrderStatus,
  getAvailableOrderTransitions,
} from "../types/order.types";

import { OrderDetailsDialog } from "./order-details-dialog";
import { OrderStatusDialog } from "./order-status-dialog";

const PAGE_SIZE = 10;

const ORDER_STATUSES: OrderStatus[] = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderTotal(order: Order, locale: string) {
  if (order.schemaVersion === 1) {
    return order.total !== undefined
      ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG").format(
          order.total,
        )
      : "—";
  }

  if (!order.currency || order.grandTotalMinor === undefined) {
    return "—";
  }

  const exponent = order.currencyExponent ?? 2;

  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: order.currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(order.grandTotalMinor / 10 ** exponent);
}

function statusClasses(status: OrderStatus) {
  switch (status) {
    case "placed":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600";

    case "processing":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600";

    case "shipped":
      return "border-violet-500/20 bg-violet-500/10 text-violet-600";

    case "delivered":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";

    case "cancelled":
      return "border-red-500/20 bg-red-500/10 text-red-600";
  }
}

function paymentClasses(status: Order["paymentStatus"]) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/10 text-emerald-600";

    case "pending":
      return "bg-amber-500/10 text-amber-600";

    case "expired":
      return "bg-red-500/10 text-red-600";

    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function OrdersPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("Orders");

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [customerId, setCustomerId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [statusTarget, setStatusTarget] = useState<Order | null>(null);

  const filters = useMemo<OrderFilters>(() => {
    const normalizedCustomerId = customerId.trim();

    return {
      page,
      limit: PAGE_SIZE,

      ...(status !== "all" ? { status } : {}),

      ...(normalizedCustomerId ? { user: normalizedCustomerId } : {}),

      ...(from ? { from: `${from}T00:00:00.000Z` } : {}),

      ...(to ? { to: `${to}T23:59:59.999Z` } : {}),
    };
  }, [page, status, customerId, from, to]);

  const ordersQuery = useOrders(filters);
  const updateMutation = useUpdateOrderStatus();

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;

  const totalOrders = pagination?.total ?? 0;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  function resetFilters() {
    setStatus("all");
    setCustomerId("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  async function handleStatusUpdate(
    order: Order,
    nextStatus: OrderStatus,
    reason?: string,
  ) {
    await updateMutation.mutateAsync({
      orderId: order._id,
      payload: {
        expectedStatus: order.status,
        status: nextStatus,
        ...(reason ? { reason } : {}),
      },
    });

    setStatusTarget(null);
    setSelectedOrderId(order._id);
  }

  const hasFilters =
    status !== "all" || customerId.trim() !== "" || from !== "" || to !== "";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="size-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("title")}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
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

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalOrders")}
              </p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {totalOrders.toLocaleString(isArabic ? "ar-EG" : "en-EG")}
              </p>
            </div>

            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("currentPageOrders")}
              </p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {orders.length.toLocaleString(isArabic ? "ar-EG" : "en-EG")}
              </p>
            </div>

            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShoppingBag className="size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-primary" />

          <h2 className="text-sm font-semibold">{t("filters.title")}</h2>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ms-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
              {t("filters.clear")}
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* Status */}
          <div className="space-y-2">
            <label
              htmlFor="order-status-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              {t("status")}
            </label>

            <select
              id="order-status-filter"
              value={status}
              onChange={(event) =>
                updateFilter(
                  setStatus,
                  event.target.value as OrderStatus | "all",
                )
              }
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">{t("filters.allStatuses")}</option>

              {ORDER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`statuses.${item}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Customer ID */}
          <div className="space-y-2">
            <label
              htmlFor="order-customer-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              {t("filters.customerId")}
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="order-customer-filter"
                value={customerId}
                onChange={(event) =>
                  updateFilter(setCustomerId, event.target.value)
                }
                placeholder={t("filters.customerIdPlaceholder")}
                className="h-10 ps-9"
              />
            </div>
          </div>

          {/* From */}
          <div className="space-y-2">
            <label
              htmlFor="order-from-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              {t("filters.from")}
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="order-from-filter"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => updateFilter(setFrom, event.target.value)}
                className="h-10 ps-9"
              />
            </div>
          </div>

          {/* To */}
          <div className="space-y-2">
            <label
              htmlFor="order-to-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              {t("filters.to")}
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="order-to-filter"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => updateFilter(setTo, event.target.value)}
                className="h-10 ps-9"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Orders table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">{t("table.title")}</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {t("table.description")}
            </p>
          </div>

          <Badge variant="secondary">
            {totalOrders.toLocaleString(isArabic ? "ar-EG" : "en-EG")}{" "}
            {t("table.orders")}
          </Badge>
        </div>

        {ordersQuery.isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
            <RefreshCw className="size-6 animate-spin text-primary" />

            <p className="text-sm">{t("loading")}</p>
          </div>
        ) : ordersQuery.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-5 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Package className="size-6" />
            </div>

            <p className="text-sm text-destructive">{t("loadError")}</p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void ordersQuery.refetch()}
            >
              {t("retry")}
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-5 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <ShoppingBag className="size-7" />
            </div>

            <div>
              <p className="font-semibold">{t("empty.title")}</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </div>

            {hasFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                {t("filters.clear")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">
                      {t("orderId")}
                    </th>

                    <th className="px-4 py-3 text-start font-medium">
                      {t("customerId")}
                    </th>

                    <th className="px-4 py-3 text-start font-medium">
                      {t("createdAt")}
                    </th>

                    <th className="px-4 py-3 text-start font-medium">
                      {t("total")}
                    </th>

                    <th className="px-4 py-3 text-start font-medium">
                      {t("payment")}
                    </th>

                    <th className="px-4 py-3 text-start font-medium">
                      {t("status")}
                    </th>

                    <th className="px-4 py-3 text-end font-medium">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const canUpdate =
                      getAvailableOrderTransitions(order).length > 0;

                    return (
                      <tr
                        key={order._id}
                        className="border-t border-border transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(order._id)}
                            className="font-semibold text-primary hover:underline"
                            title={order._id}
                          >
                            #{order._id.slice(-8).toUpperCase()}
                          </button>
                        </td>

                        <td className="max-w-40 px-4 py-4">
                          <span
                            className="block truncate text-muted-foreground"
                            title={order.user}
                          >
                            {order.user.slice(0, 8)}...
                            {order.user.slice(-4)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                          {formatDate(order.createdAt, locale)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-semibold">
                          {formatOrderTotal(order, locale)}
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            className={paymentClasses(order.paymentStatus)}
                          >
                            {t(`paymentStatuses.${order.paymentStatus}`)}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <Badge className={statusClasses(order.status)}>
                            {t(`statuses.${order.status}`)}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("viewDetails")}
                              onClick={() => setSelectedOrderId(order._id)}
                            >
                              <Eye className="size-4" />
                            </Button>

                            {canUpdate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStatusTarget(order)}
                              >
                                {t("updateStatus")}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t("pagination.page")}{" "}
                <span className="font-semibold text-foreground">
                  {pagination?.page ?? page}
                </span>{" "}
                {t("pagination.of")}{" "}
                <span className="font-semibold text-foreground">
                  {totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || ordersQuery.isFetching}
                  onClick={() => setPage((current) => current - 1)}
                >
                  {t("pagination.previous")}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || ordersQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  {t("pagination.next")}
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Details */}
      <OrderDetailsDialog
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onUpdateStatus={(order) => {
          setSelectedOrderId(null);
          setStatusTarget(order);
        }}
      />

      {/* Status update */}
      <OrderStatusDialog
        order={statusTarget}
        isPending={updateMutation.isPending}
        onClose={() => setStatusTarget(null)}
        onConfirm={(order, nextStatus, reason) => {
          void handleStatusUpdate(order, nextStatus, reason);
        }}
      />
    </div>
  );
}
