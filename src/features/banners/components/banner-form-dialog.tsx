"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Megaphone, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bannerSchema, type BannerFormValues } from "../schemas/banner.schema";
import type { Banner, BannerPayload } from "../types/banner.types";

type Props = {
  open: boolean;
  banner: Banner | null;
  isPending: boolean;
  isArabic: boolean;
  onClose: () => void;
  onSubmit: (payload: BannerPayload) => void;
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function BannerFormDialog({
  open,
  banner,
  isPending,
  isArabic,
  onClose,
  onSubmit,
}: Props) {
  const editing = Boolean(banner);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : (banner?.image ?? "")),
    [imageFile, banner?.image],
  );
  const t = useMemo(
    () => ({
      create: isArabic ? "إضافة بانر" : "Create banner",
      edit: isArabic ? "تعديل البانر" : "Edit banner",
      description: isArabic
        ? "أدخل بيانات البانر وإعدادات ظهوره."
        : "Configure the banner content, placement, and schedule.",
      language: isArabic ? "اللغة" : "Language",
      view: isArabic ? "نوع العرض" : "Placement",
      desktop: isArabic ? "سطح المكتب" : "Desktop",
      mobile: isArabic ? "الهاتف" : "Mobile",
      title: isArabic ? "العنوان" : "Title",
      alt: isArabic ? "النص البديل للصورة" : "Image alt text",
      image: isArabic ? "صورة البانر" : "Banner image",
      imageHelp: isArabic
        ? "صورة واحدة، بحد أقصى 5 ميجابايت."
        : "One image, maximum 5 MB.",
      link: isArabic ? "رابط الوجهة" : "Destination URL",
      sort: isArabic ? "ترتيب العرض" : "Sort order",
      active: isArabic ? "مفعل" : "Active",
      starts: isArabic ? "يبدأ في" : "Starts at",
      ends: isArabic ? "ينتهي في" : "Ends at",
      cancel: isArabic ? "إلغاء" : "Cancel",
      save: isArabic ? "حفظ البانر" : "Save banner",
      requiredImage: isArabic
        ? "صورة البانر مطلوبة."
        : "A banner image is required.",
      invalidImage: isArabic
        ? "اختر صورة صالحة بحجم لا يتجاوز 5 ميجابايت."
        : "Choose a valid image up to 5 MB.",
      chooseImage: isArabic ? "اختيار صورة" : "Choose image",
      replace: isArabic ? "استبدال الصورة" : "Replace image",
    }),
    [isArabic],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      language: "en",
      view: "desktop",
      title: "",
      altText: "",
      linkUrl: "",
      sortOrder: 0,
      isActive: true,
      startsAt: "",
      endsAt: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      language: banner?.language ?? "en",
      view: banner?.view ?? "desktop",
      title: banner?.title ?? "",
      altText: banner?.altText ?? "",
      linkUrl: banner?.linkUrl ?? "",
      sortOrder: banner?.sortOrder ?? 0,
      isActive: banner?.isActive ?? true,
      startsAt: toDateTimeLocal(banner?.startsAt),
      endsAt: toDateTimeLocal(banner?.endsAt),
    });
  }, [open, banner, reset]);

  useEffect(() => {
    if (!imageFile || !imagePreview.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imageFile, imagePreview]);

  function selectImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error(t.invalidImage);
      return;
    }
    setImageFile(file);
  }

  function closeDialog() {
    setImageFile(null);
    onClose();
  }

  function submit(values: BannerFormValues) {
    if (!editing && !imageFile) {
      toast.error(t.requiredImage);
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      altText: values.altText.trim(),
      linkUrl: values.linkUrl.trim() || null,
      startsAt: toIso(values.startsAt),
      endsAt: toIso(values.endsAt),
      imageFile,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && closeDialog()}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-x-hidden overflow-y-hidden p-0 sm:max-w-5xl">
        <div className="shrink-0 border-b bg-muted/30 px-6 py-5">
          <DialogHeader className="flex-row items-start gap-3 space-y-0 pe-8 text-start">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold">
                {editing ? t.edit : t.create}
              </DialogTitle>
              <DialogDescription>{t.description}</DialogDescription>
            </div>
          </DialogHeader>
        </div>
        <form
          onSubmit={handleSubmit(submit)}
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <div className="min-w-0 space-y-6 p-4 sm:p-6">
            <div className="space-y-4">
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <Label>{t.language}</Label>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">???????</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label>{t.view}</Label>
                  <Controller
                    name="view"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desktop">{t.desktop}</SelectItem>
                          <SelectItem value="mobile">{t.mobile}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.title}</Label>
                <Input {...register("title")} maxLength={150} />
              </div>
              <div className="space-y-2">
                <Label>{t.alt}</Label>
                <Input {...register("altText")} maxLength={300} />
                {errors.altText ? (
                  <p className="text-xs text-destructive">
                    {errors.altText.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>{t.link}</Label>
                <Input
                  {...register("linkUrl")}
                  dir="ltr"
                  placeholder="/products or https://example.com"
                />
                {errors.linkUrl ? (
                  <p className="text-xs text-destructive">
                    {errors.linkUrl.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.sort}</Label>
                  <Input
                    {...register("sortOrder", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={1000000}
                  />
                  {errors.sortOrder ? (
                    <p className="text-xs text-destructive">
                      {errors.sortOrder.message}
                    </p>
                  ) : null}
                </div>
                <label className="flex h-10 items-center gap-2 self-end rounded-lg border px-3 text-sm">
                  <input
                    {...register("isActive")}
                    type="checkbox"
                    className="size-4 accent-primary"
                  />
                  {t.active}
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.starts}</Label>
                  <Input {...register("startsAt")} type="datetime-local" />
                  {errors.startsAt ? (
                    <p className="text-xs text-destructive">
                      {errors.startsAt.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>{t.ends}</Label>
                  <Input {...register("endsAt")} type="datetime-local" />
                  {errors.endsAt ? (
                    <p className="text-xs text-destructive">
                      {errors.endsAt.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.image}</Label>
              <div className="overflow-hidden rounded-xl border bg-muted/30">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt={t.image}
                      width={640}
                      height={480}
                      unoptimized
                      className="h-48 w-full object-contain sm:h-64 md:h-72"
                    />
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="absolute end-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
                      aria-label="Remove selected image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground sm:h-64 md:h-72">
                    <ImagePlus className="size-8" />
                    <span className="text-xs">{t.imageHelp}</span>
                  </div>
                )}
                <label className="flex cursor-pointer items-center justify-center gap-2 border-t px-3 py-3 text-sm font-medium hover:bg-muted">
                  <UploadCloud className="size-4" />
                  {imagePreview ? t.replace : t.chooseImage}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => selectImage(event.target.files?.[0])}
                  />
                </label>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {t.imageHelp}
              </p>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4">
            <Button type="button" variant="outline" onClick={closeDialog}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
