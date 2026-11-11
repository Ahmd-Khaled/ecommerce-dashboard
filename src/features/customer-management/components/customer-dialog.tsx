"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateCustomerSchema, type UpdateCustomerFormValues } from "../schemas/customer.schema";
import type { Customer } from "../types/customer.types";

type Props = {
  customer: Customer; mode: "view" | "edit"; isPending: boolean;
  onClose: () => void; onUpdate: (values: UpdateCustomerFormValues) => Promise<void>;
};

export function CustomerDialog({ customer, mode, isPending, onClose, onUpdate }: Props) {
  const t = useTranslations("CustomerManagement.dialog");
  const isEdit = mode === "edit";
  const form = useForm<UpdateCustomerFormValues>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: { firstName: customer.firstName, lastName: customer.lastName, role: customer.role },
  });
  const fieldClass = "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
  const labelClass = "mb-1.5 block text-sm font-medium";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">{isEdit ? t("editTitle") : t("viewTitle")}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label={t("close")}><X className="size-4" /></button>
        </div>
        <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelClass}>{t("firstName")}</label><input {...form.register("firstName")} disabled={!isEdit} className={fieldClass} />{isEdit && <p className="mt-1 text-xs text-destructive">{form.formState.errors.firstName?.message}</p>}</div>
            <div><label className={labelClass}>{t("lastName")}</label><input {...form.register("lastName")} disabled={!isEdit} className={fieldClass} />{isEdit && <p className="mt-1 text-xs text-destructive">{form.formState.errors.lastName?.message}</p>}</div>
          </div>
          <div><label className={labelClass}>{t("email")}</label><input value={customer.email} disabled className={fieldClass} /></div>
          <div><label className={labelClass}>{t("role")}</label><select {...form.register("role")} disabled={!isEdit} className={fieldClass}><option value="user">{t("user")}</option><option value="guest">{t("guest")}</option></select></div>
          {!isEdit && <>
            <div><label className={labelClass}>{t("status")}</label><input value={t(`statuses.${customer.status}`)} disabled className={fieldClass} /></div>
            <div><label className={labelClass}>{t("confirmedAt")}</label><input value={customer.confirmedAt ? new Date(customer.confirmedAt).toLocaleDateString() : t("notConfirmed")} disabled className={fieldClass} /></div>
          </>}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{t("close")}</button>
            {isEdit && <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{isPending && <Loader2 className="size-4 animate-spin" />}{t("save")}</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
