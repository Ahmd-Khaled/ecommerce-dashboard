"use client";

import { Loader2, PackageX } from "lucide-react";
type Props = { isPending: boolean; isArabic: boolean; labels: { title: string; description: string; cancel: string; confirm: string; archiving: string }; onClose: () => void; onConfirm: () => void };

export function ProductsArchiveDialog({ isPending, isArabic, labels, onClose, onConfirm }: Props) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir={isArabic ? "rtl" : "ltr"}>
    <div role="dialog" aria-modal="true" aria-labelledby="archive-product-title" className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
      <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><PackageX className="size-5" /></div>
      <h2 id="archive-product-title" className="mt-4 text-lg font-bold">{labels.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{labels.description}</p>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={isPending} onClick={onClose} className="h-9 rounded-lg border px-4 text-sm font-medium disabled:opacity-60">{labels.cancel}</button><button type="button" disabled={isPending} onClick={onConfirm} className="inline-flex h-9 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-destructive-foreground disabled:opacity-60">{isPending && <Loader2 className="size-4 animate-spin" />}{isPending ? labels.archiving : labels.confirm}</button></div>
    </div>
  </div>;
}
