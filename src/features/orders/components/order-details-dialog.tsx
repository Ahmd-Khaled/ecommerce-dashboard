"use client";

import {
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useLocale, useTranslations } from "next-intl";

import { useOrderDetails } from "../hooks/use-orders";

import type {
  Order,
  OrderPaymentStatus,
  OrderStatus,
} from "../types/order.types";

type OrderDetailsDialogProps = {
  orderId: string | null;
  onClose: () => void;
  onUpdateStatus: (order: Order) => void;
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(
  minorAmount: number,
  currency: string,
  exponent: number,
  locale: string,
) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(minorAmount / 10 ** exponent);
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

function paymentClasses(status: OrderPaymentStatus) {
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

export function OrderDetailsDialog({
  orderId,
  onClose,
  onUpdateStatus,
}: OrderDetailsDialogProps) {
  const locale = useLocale();
  const t = useTranslations("Orders");

  const orderQuery = useOrderDetails(orderId ?? "", Boolean(orderId));

  const order = orderQuery.data;

  function money(minorAmount: number | undefined) {
    if (!order || minorAmount === undefined) {
      return "—";
    }

    if (!order.currency) {
      return "—";
    }

    return formatMoney(
      minorAmount,
      order.currency,
      order.currencyExponent ?? 2,
      locale,
    );
  }

  function itemUnitPrice(item: Order["items"][number]) {
    if (order?.schemaVersion === 2) {
      return money(item.unitPriceMinor);
    }

    return item.unitPrice !== undefined
      ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG").format(
          item.unitPrice,
        )
      : "—";
  }

  function itemTotal(item: Order["items"][number]) {
    if (order?.schemaVersion === 2) {
      return money(item.lineTotalMinor);
    }

    return item.unitPrice !== undefined
      ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG").format(
          item.unitPrice * item.quantity,
        )
      : "—";
  }

  return (
    <Dialog
      open={Boolean(orderId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold">
                {t("details.title")}
              </DialogTitle>

              <DialogDescription className="mt-1 break-all">
                {orderId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {orderQuery.isLoading && (
          <div className="flex min-h-48 items-center justify-center">
            <RefreshCw className="size-6 animate-spin text-primary" />
          </div>
        )}

        {orderQuery.isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
            <p className="text-sm text-destructive">{t("loadError")}</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void orderQuery.refetch()}
            >
              {t("retry")}
            </Button>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Summary */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{t("status")}</p>

                <Badge className={`mt-2 ${statusClasses(order.status)}`}>
                  {t(`statuses.${order.status}`)}
                </Badge>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{t("payment")}</p>

                <Badge
                  className={`mt-2 ${paymentClasses(order.paymentStatus)}`}
                >
                  {t(`paymentStatuses.${order.paymentStatus}`)}
                </Badge>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  {t("createdAt")}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {formatDate(order.createdAt, locale)}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{t("total")}</p>

                <p className="mt-2 text-sm font-bold">
                  {order.schemaVersion === 2
                    ? money(order.grandTotalMinor)
                    : order.total !== undefined
                      ? new Intl.NumberFormat(
                          locale === "ar" ? "ar-EG" : "en-EG",
                        ).format(order.total)
                      : "—"}
                </p>
              </div>
            </section>

            {order.legacy && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
                {t("legacyWarning")}
              </div>
            )}

            {/* Customer */}
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <UserRound className="size-4 text-primary" />
                {t("customer")}
              </h3>

              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">
                  {t("customerId")}
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {order.user}
                </p>
              </div>
            </section>

            {/* Items */}
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <Package className="size-4 text-primary" />
                {t("items")}
              </h3>

              <div className="overflow-hidden rounded-xl border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="p-3 text-start">{t("product")}</th>

                        <th className="p-3 text-center">{t("quantity")}</th>

                        <th className="p-3 text-end">{t("unitPrice")}</th>

                        <th className="p-3 text-end">{t("lineTotal")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.items.map((item, index) => (
                        <tr
                          key={`${item.product}-${index}`}
                          className="border-t border-border"
                        >
                          <td className="p-3">
                            <p className="font-medium">
                              {item.name || t("unknownProduct")}
                            </p>

                            {item.sku && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.sku}
                              </p>
                            )}
                          </td>

                          <td className="p-3 text-center">{item.quantity}</td>

                          <td className="p-3 text-end">
                            {itemUnitPrice(item)}
                          </td>

                          <td className="p-3 text-end font-semibold">
                            {itemTotal(item)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {order.schemaVersion === 2 && (
                <div className="ms-auto max-w-sm space-y-2 rounded-xl border border-border bg-muted/20 p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("subtotal")}
                    </span>
                    <span>{money(order.subtotalMinor)}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("shipping")}
                    </span>
                    <span>{money(order.shippingMinor)}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("discount")}
                    </span>
                    <span>{money(order.discountMinor)}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{t("tax")}</span>
                    <span>{money(order.taxMinor)}</span>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-border pt-3 font-bold">
                    <span>{t("total")}</span>
                    <span>{money(order.grandTotalMinor)}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Shipping */}
            {order.shippingAddress && (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <MapPin className="size-4 text-primary" />
                  {t("shippingAddress")}
                </h3>

                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">
                    {order.shippingAddress.fullName}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.shippingAddress.phone}
                  </p>

                  <p className="mt-3 text-sm leading-6">
                    {[
                      order.shippingAddress.street,
                      order.shippingAddress.building,
                      order.shippingAddress.apartment,
                      order.shippingAddress.city,
                      order.shippingAddress.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </section>
            )}

            {/* Status history */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <CalendarDays className="size-4 text-primary" />
                  {t("statusHistory")}
                </h3>

                <div className="space-y-3 rounded-xl border border-border p-4">
                  {order.statusHistory.map((entry, index) => (
                    <div
                      key={`${entry.status}-${entry.at}-${index}`}
                      className="relative flex gap-3"
                    >
                      <div className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold">
                            {t(`statuses.${entry.status}`)}
                          </p>

                          <time className="text-xs text-muted-foreground">
                            {formatDate(entry.at, locale)}
                          </time>
                        </div>

                        {entry.reason && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {entry.reason}
                          </p>
                        )}

                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          {t("actor")}: {entry.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cancellation details */}
            {order.cancellationReason && (
              <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm font-semibold text-red-600">
                  {t("cancellationReason")}
                </p>

                <p className="mt-2 text-sm">{order.cancellationReason}</p>
              </section>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={onClose}>
                {t("close")}
              </Button>

              {!order.legacy && (
                <Button
                  disabled={orderQuery.isFetching}
                  onClick={() => onUpdateStatus(order)}
                >
                  <CreditCard className="size-4" />
                  {t("updateStatus")}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
