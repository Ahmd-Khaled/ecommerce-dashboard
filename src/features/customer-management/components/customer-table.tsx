"use client";

import { ChevronLeft, ChevronRight, Eye, Loader2, LockKeyhole, Pencil, Trash2, UnlockKeyhole } from "lucide-react";
import type { Customer, CustomerStatus } from "../types/customer.types";

type Labels = {
  customer: string; role: string; status: string; created: string; actions: string; user: string; guest: string;
  active: string; pending: string; frozen: string; deleted: string; view: string; edit: string; freeze: string;
  unfreeze: string; delete: string; loading: string; noResults: string; page: string; of: string; previous: string; next: string;
};
type Props = {
  customers: Customer[]; isLoading: boolean; isFetching: boolean; page: number; totalPages: number;
  locale: string; isArabic: boolean; labels: Labels; onPageChange: (page: number) => void;
  onView: (customer: Customer) => void; onEdit: (customer: Customer) => void;
  onStatusChange: (customer: Customer) => void; onDelete: (customer: Customer) => void; isUpdating: boolean;
};

function statusClass(status: CustomerStatus) {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-600";
    case "pending": return "bg-blue-500/10 text-blue-600";
    case "frozen": return "bg-amber-500/10 text-amber-600";
    case "deleted": return "bg-red-500/10 text-red-600";
  }
}

function initials(customer: Customer) {
  return `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();
}

export function CustomerTable({ customers, isLoading, isFetching, page, totalPages, locale, isArabic, labels, onPageChange, onView, onEdit, onStatusChange, onDelete, isUpdating }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-border bg-muted/40"><tr className="text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"><th className="px-5 py-4">{labels.customer}</th><th className="px-5 py-4">{labels.role}</th><th className="px-5 py-4">{labels.status}</th><th className="px-5 py-4">{labels.created}</th><th className="px-5 py-4 text-end">{labels.actions}</th></tr></thead>
        <tbody className="divide-y divide-border">
          {isLoading ? <tr><td colSpan={5} className="px-5 py-12 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">{labels.loading}</p></td></tr> : customers.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">{labels.noResults}</td></tr> : customers.map((customer) => {
            const isDeleted = customer.status === "deleted";
            const canManageStatus = customer.status === "active" || customer.status === "frozen";
            return <tr key={customer.id} className="transition-colors hover:bg-muted/30">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(customer)}</div><div className="min-w-0"><p className="font-semibold">{customer.firstName} {customer.lastName}</p><p className="truncate text-xs text-muted-foreground">{customer.email}</p></div></div></td>
              <td className="px-5 py-4"><span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">{customer.role === "guest" ? labels.guest : labels.user}</span></td>
              <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(customer.status)}`}>{labels[customer.status]}</span></td>
              <td className="px-5 py-4 text-muted-foreground">{new Date(customer.createdAt).toLocaleDateString(locale)}</td>
              <td className="px-5 py-4"><div className="flex items-center justify-end gap-1">
                <button type="button" onClick={() => onView(customer)} title={labels.view} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Eye className="size-4" /></button>
                {!isDeleted && <><button type="button" onClick={() => onEdit(customer)} title={labels.edit} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Pencil className="size-4" /></button>
                  {canManageStatus && <button type="button" onClick={() => onStatusChange(customer)} disabled={isUpdating} title={customer.status === "active" ? labels.freeze : labels.unfreeze} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">{customer.status === "active" ? <LockKeyhole className="size-4" /> : <UnlockKeyhole className="size-4" />}</button>}
                  <button type="button" onClick={() => onDelete(customer)} title={labels.delete} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button></>}
              </div></td>
            </tr>;
          })}
        </tbody>
      </table></div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{labels.page} {page} {labels.of} {totalPages}</p><div className="flex items-center gap-2">
        <button type="button" disabled={page <= 1 || isFetching} onClick={() => onPageChange(Math.max(1, page - 1))} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">{isArabic ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}{labels.previous}</button>
        <button type="button" disabled={page >= totalPages || isFetching} onClick={() => onPageChange(Math.min(totalPages, page + 1))} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">{labels.next}{isArabic ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}</button>
      </div></div>
    </section>
  );
}
