"use client";

import { useLocale, useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiErrorMessage } from "@/lib/api/axios";

import { usePaymentOrderDetails } from "../hooks/use-payments";
import { PaymentStatusBadge } from "./payment-status-badge";
import type {
  OrderStatus,
  PaymentOrder,
  PaymentStatus,
} from "../types/payment.types";

type PaymentDetailsDialogProps = {
  orderId: string | null;
  onClose: () => void;
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderAmount(order: PaymentOrder, locale: string) {
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

function formatItemAmount(
  amountMinor: number | undefined,
  legacyAmount: number | undefined,
  order: PaymentOrder,
  locale: string,
) {
  if (
    order.schemaVersion === 2 &&
    typeof amountMinor === "number" &&
    order.currency
  ) {
    const exponent = order.currencyExponent ?? 2;

    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
      style: "currency",
      currency: order.currency,
      minimumFractionDigits: exponent,
      maximumFractionDigits: exponent,
    }).format(amountMinor / 10 ** exponent);
  }

  return typeof legacyAmount === "number"
    ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG").format(
        legacyAmount,
      )
    : "—";
}

export function PaymentDetailsDialog({
  orderId,
  onClose,
}: PaymentDetailsDialogProps) {
  const locale = useLocale();
  const t = useTranslations("PaymentsManagement");

  const query = usePaymentOrderDetails(orderId ?? "", Boolean(orderId));

  const order = query.data;

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

  return (
    <Dialog
      open={Boolean(orderId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("details.title")}</DialogTitle>
          <DialogDescription>{t("details.description")}</DialogDescription>
        </DialogHeader>

        {query.isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : query.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {apiErrorMessage(query.error)}
          </div>
        ) : order ? (
          <div className="space-y-4">
            <Card size="sm">
              <CardContent className="grid gap-4 pt-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {t("fields.orderId")}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs">
                    {order._id}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {t("fields.customerId")}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs">
                    {order.user}
                  </p>
                </div>

                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    {t("fields.paymentStatus")}
                  </p>
                  <PaymentStatusBadge
                    status={order.paymentStatus}
                    legacy={order.legacy}
                    labels={{
                      ...statusLabels,
                      legacy: t("paymentStatuses.legacy"),
                    }}
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    {t("fields.orderStatus")}
                  </p>
                  <Badge variant="secondary">
                    {orderStatusLabels[order.status]}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.amount")}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {formatOrderAmount(order, locale)}
                  </p>

                  {order.legacy && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("legacyAmountNote")}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.createdAt")}
                  </p>
                  <p className="mt-1 text-sm">
                    {formatDate(order.createdAt, locale)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t("details.items")}</h3>

              <div className="overflow-hidden rounded-xl border">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex items-center justify-between gap-3 border-b p-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.name ?? t("unknownProduct")}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.sku ?? item.product} · {t("details.quantity")}:{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-medium tabular-nums">
                      {formatItemAmount(
                        item.lineTotalMinor,
                        typeof item.unitPrice === "number"
                          ? item.unitPrice * item.quantity
                          : undefined,
                        order,
                        locale,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {order.shippingAddress && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {t("details.shippingAddress")}
                </h3>

                <Card size="sm">
                  <CardContent className="space-y-1 pt-3 text-sm">
                    <p className="font-medium">
                      {order.shippingAddress.fullName}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-muted-foreground">
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
                  </CardContent>
                </Card>
              </section>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {t("details.readOnlyNotice")}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {t("loading")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
