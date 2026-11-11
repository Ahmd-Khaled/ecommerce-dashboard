"use client";

import { useState } from "react";

import { AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";

import {
  getAvailableOrderTransitions,
  type Order,
  type OrderStatus,
} from "../types/order.types";

type OrderStatusDialogProps = {
  order: Order | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (order: Order, status: OrderStatus, reason?: string) => void;
};

export function OrderStatusDialog(props: OrderStatusDialogProps) {
  const { order } = props;

  return (
    <OrderStatusDialogForm
      key={order ? `${order._id}:${order.status}:${order.paymentStatus}` : "closed"}
      {...props}
    />
  );
}

function OrderStatusDialogForm({
  order,
  isPending,
  onClose,
  onConfirm,
}: OrderStatusDialogProps) {
  const t = useTranslations("Orders");

  const availableStatuses = order ? getAvailableOrderTransitions(order) : [];

  const [status, setStatus] = useState<OrderStatus | "">(
    () => availableStatuses[0] ?? "",
  );
  const [reason, setReason] = useState("");

  function handleConfirm() {
    if (!order || !status || isPending) return;

    onConfirm(order, status, reason.trim() || undefined);
  }

  return (
    <Dialog
      open={Boolean(order)}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <AlertTriangle className="size-5" />
          </div>

          <DialogTitle className="text-lg font-bold">
            {t("statusDialog.title")}
          </DialogTitle>

          <DialogDescription>{t("statusDialog.description")}</DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">{t("orderId")}</p>

              <p className="mt-1 break-all text-sm font-semibold">
                {order._id}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {t("currentStatus")}:{" "}
                <span className="font-semibold text-foreground">
                  {t(`statuses.${order.status}`)}
                </span>
              </p>
            </div>

            {availableStatuses.length === 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
                {t("statusDialog.noTransitions")}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="order-next-status"
                    className="text-sm font-medium"
                  >
                    {t("statusDialog.nextStatus")}
                  </label>

                  <select
                    id="order-next-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as OrderStatus)
                    }
                    disabled={isPending}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {availableStatuses.map((item) => (
                      <option key={item} value={item}>
                        {t(`statuses.${item}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="order-status-reason"
                    className="text-sm font-medium"
                  >
                    {t("statusDialog.reason")}
                    <span className="ms-1 text-xs text-muted-foreground">
                      ({t("optional")})
                    </span>
                  </label>

                  <Input
                    id="order-status-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder={t("statusDialog.reasonPlaceholder")}
                    maxLength={500}
                    disabled={isPending}
                  />

                  <p className="text-end text-xs text-muted-foreground">
                    {reason.length}/500
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {t("cancel")}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isPending || !status || availableStatuses.length === 0}
            variant={status === "cancelled" ? "destructive" : "default"}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}

            {isPending ? t("statusDialog.updating") : t("statusDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
