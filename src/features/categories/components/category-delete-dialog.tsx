"use client";

import { AlertTriangle, Folder, Package } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useTranslations } from "next-intl";

import type { Category } from "../types/category.types";

type CategoryDeleteDialogProps = {
  open: boolean;
  category: Category | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CategoryDeleteDialog({
  open,
  category,
  isPending,
  onClose,
  onConfirm,
}: CategoryDeleteDialogProps) {
  const t = useTranslations("Categories");

  if (!category) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md overflow-hidden p-0">
        {/* Header */}
        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>

            <DialogTitle className="text-lg font-bold">
              {t("deleteTitle")}
            </DialogTitle>

            <DialogDescription className="leading-6">
              {t("deleteDescription", {
                name: category.name,
              })}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Category information */}
        <div className="mx-6 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
              {category.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={category.image}
                  alt={category.name}
                  className="size-full object-cover"
                />
              ) : (
                <Folder className="size-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{category.name}</p>

              <p dir="ltr" className="truncate text-xs text-muted-foreground">
                {category.slug}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <Package className="size-3.5" />
              {category.productCount ?? 0}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mx-6 mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />

            <p className="text-xs leading-6 text-muted-foreground">
              {t("deleteWarning")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-2 border-t border-border bg-muted/20 p-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            {t("cancel")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("deleting")}
              </>
            ) : (
              <>
                <Trash2Icon />
                {t("confirmDelete")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Trash2Icon() {
  return <AlertTriangle className="size-4" />;
}
