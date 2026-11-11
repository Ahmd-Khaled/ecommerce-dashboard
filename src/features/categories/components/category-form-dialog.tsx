"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useTranslations } from "next-intl";
import { ImagePlus, Layers3 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  categorySchema,
  type CategoryFormValues,
} from "../schemas/category.schema";

import type { Category, CategoryPayload } from "../types/category.types";

type Props = {
  open: boolean;
  category: Category | null;
  categories: Category[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoryPayload) => void;
};

function getDescendantIds(
  categoryId: string,
  categories: Category[],
): Set<string> {
  const result = new Set<string>([categoryId]);
  let changed = true;

  while (changed) {
    changed = false;

    categories.forEach((category) => {
      const parentId =
        typeof category.parent === "string"
          ? category.parent
          : category.parent?._id;

      if (parentId && result.has(parentId) && !result.has(category._id)) {
        result.add(category._id);
        changed = true;
      }
    });
  }

  return result;
}

export function CategoryFormDialog({
  open,
  category,
  categories,
  isPending,
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations("Categories");
  const isEditing = Boolean(category);

  const [imagePreview, setImagePreview] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const excludedIds = useMemo(
    () =>
      category ? getDescendantIds(category._id, categories) : new Set<string>(),
    [category, categories],
  );

  const availableParents = categories.filter(
    (item) => !excludedIds.has(item._id) && item.isActive,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof categorySchema>, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parent: "",
      isActive: true,
      sortOrder: 0,
      imageFile: null,
    },
  });

  const name = watch("name");
  const imageFile = watch("imageFile");

  useEffect(() => {
    if (!open) return;

    const parentId =
      typeof category?.parent === "string"
        ? category.parent
        : (category?.parent?._id ?? "");

    reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      parent: parentId,
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder ?? 0,
      imageFile: null,
    });

    setImagePreview(category?.image ?? "");
    setSlugManuallyEdited(Boolean(category));
  }, [open, category, reset]);

  useEffect(() => {
    if (!imageFile) return;

    const preview = URL.createObjectURL(imageFile);
    setImagePreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleNameChange(value: string) {
    setValue("name", value, { shouldValidate: true });

    if (!slugManuallyEdited) {
      setValue("slug", generateSlug(value), {
        shouldValidate: true,
      });
    }
  }

  function handleImageChange(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setValue("imageFile", file, {
      shouldValidate: true,
    });
  }

  function submit(values: CategoryFormValues) {
    onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description || "",
      parent: values.parent || null,
      isActive: values.isActive,
      sortOrder: values.sortOrder,
      imageFile: values.imageFile ?? null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-5 sm:px-8">
          <DialogHeader className="flex-row items-start gap-4 space-y-0 pe-8 text-start">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers3 className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">
                {isEditing ? t("editTitle") : t("createTitle")}
              </DialogTitle>
              <DialogDescription className="leading-6">
                {isEditing ? t("editDescription") : t("createDescription")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(submit)} className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {t("name")}
                  </label>
                  <input
                    {...register("name")}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {t("slug")}
                  </label>
                  <input
                    {...register("slug")}
                    onChange={(event) => {
                      setSlugManuallyEdited(true);
                      setValue("slug", event.target.value.toLowerCase(), {
                        shouldValidate: true,
                      });
                    }}
                    placeholder="electronics"
                    dir="ltr"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("description")}
                </label>
                <textarea
                  {...register("description")}
                  rows={5}
                  maxLength={1000}
                  placeholder={t("descriptionPlaceholder")}
                  className="w-full resize-y rounded-xl border border-input bg-background p-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {t("parent")}
                  </label>
                  <select
                    {...register("parent")}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">{t("rootCategory")}</option>
                    {availableParents.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {t("sortOrder")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register("sortOrder")}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  {errors.sortOrder && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.sortOrder.message}
                    </p>
                  )}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition hover:bg-muted/40">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="size-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">{t("active")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("activeDescription")}
                  </p>
                </div>
              </label>
            </div>

            <aside className="h-fit min-w-0 space-y-4 rounded-2xl border border-border bg-muted/20 p-5">
              <div>
                <p className="text-sm font-semibold">{t("image")}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("imageHint")}
                </p>
              </div>

              <div className="relative mx-auto flex aspect-square w-full max-w-64 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt={t("imagePreview")}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="size-8" />
                    <span className="text-xs">{t("chooseImage")}</span>
                  </div>
                )}
              </div>

              <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium transition hover:bg-muted">
                <ImagePlus className="size-4" />
                {t("chooseImage")}

                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0])
                  }
                />
              </label>
            </aside>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
            >
              {t("cancel")}
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("saving")
                : isEditing
                  ? t("saveChanges")
                  : t("createCategory")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
