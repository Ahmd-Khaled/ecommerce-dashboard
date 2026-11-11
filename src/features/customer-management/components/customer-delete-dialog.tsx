"use client";

import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Customer } from "../types/customer.types";

type Props = { customer: Customer; isPending: boolean; onClose: () => void; onDelete: () => void };

export function CustomerDeleteDialog({ customer, isPending, onClose, onDelete }: Props) {
  const t = useTranslations("CustomerManagement");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{t("deleteTitle")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("deleteDescription", { name: `${customer.firstName} ${customer.lastName}` })}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label={t("cancel")}><X className="size-4" /></button></div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{t("cancel")}</button><button type="button" onClick={onDelete} disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-60">{isPending && <Loader2 className="size-4 animate-spin" />}{t("delete")}</button></div>
      </div>
    </div>
  );
}
