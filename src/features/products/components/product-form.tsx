"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Package,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "../schemas/product.schema";

import { useCreateProduct, useUpdateProduct } from "../hooks/use-products";

import { useProductCategories } from "../hooks/use-product-categories";

import type { Product } from "../types/product.types";
import { ImagePreview } from "./image-preview";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
}

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
}

const defaultValues: ProductFormInput = {
  name: "",
  slug: "",
  description: "",
  sku: "",
  price: 0,
  compareAtPrice: "",
  stock: 0,
  category: "",
  isActive: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getCategoryId(product?: Product) {
  if (!product) return "";

  return typeof product.category === "string"
    ? product.category
    : (product.category?._id ?? "");
}

function getInitialValues(product?: Product): ProductFormInput {
  if (!product) return defaultValues;

  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    description: product.description ?? "",
    sku: product.sku ?? "",
    price: product.price ?? 0,
    compareAtPrice: product.compareAtPrice ?? "",
    stock: product.stock ?? 0,
    category: getCategoryId(product),
    isActive: product.isActive ?? true,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {children}

      <FieldError message={error} />
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60";

const textareaClass =
  "min-h-32 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugManuallyChanged = useRef(false);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const { data: categories = [], isLoading: categoriesLoading } =
    useProductCategories();

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [imageError, setImageError] = useState("");

  const isPending = createProduct.isPending || updateProduct.isPending;

  const initialValues = useMemo(() => getInitialValues(product), [product]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues,
  });

  const productName = watch("name");
  const price = watch("price");
  const compareAtPrice = watch("compareAtPrice");

  useEffect(() => {
    if (mode !== "edit" || !product) return;

    setImages(
      (product.images ?? []).map((url, index) => ({
        id: `existing-${index}`,
        url,
      })),
    );
  }, [mode, product]);

  useEffect(() => {
    if (mode === "create" && !slugManuallyChanged.current) {
      setValue("slug", slugify(productName), {
        shouldValidate: true,
      });
    }
  }, [mode, productName, setValue]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.file) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  const discount = useMemo(() => {
    const original = Number(compareAtPrice);

    if (!original || original <= Number(price)) return 0;

    return Math.round(((original - Number(price)) / original) * 100);
  }, [price, compareAtPrice]);

  function addImages(files: FileList | null) {
    if (!files) return;

    setImageError("");

    const selectedFiles = Array.from(files);

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setImageError("Choose image files smaller than 5 MB each.");
      return;
    }

    if (images.length + selectedFiles.length > 10) {
      setImageError("You can upload a maximum of 10 images.");
      return;
    }

    const newImages = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((current) => [...current, ...newImages]);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);

      if (image?.file) {
        URL.revokeObjectURL(image.url);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function onSubmit(values: ProductFormValues) {
    setImageError("");

    if (images.length === 0) {
      setImageError("At least one product image is required.");
      return;
    }

    const uploadedFiles = images
      .filter((image) => image.file)
      .map((image) => image.file!);

    const existingImageUrls = images
      .filter((image) => !image.file)
      .map((image) => image.url);

    const payload = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      compareAtPrice:
        values.compareAtPrice === ""
          ? undefined
          : Number(values.compareAtPrice),
      images: uploadedFiles.length ? [] : existingImageUrls,
      imageFiles: uploadedFiles,
    };

    if (mode === "create") {
      createProduct.mutate(payload, {
        onSuccess: () => {
          router.push("/products");
          router.refresh();
        },
      });

      return;
    }

    if (!product) return;

    updateProduct.mutate(
      {
        productId: product._id,
        payload,
      },
      {
        onSuccess: () => {
          router.push("/products");
          router.refresh();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/products"
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to products
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "create" ? "Create product" : "Edit product"}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "create"
                  ? "Add a new product to your catalog."
                  : "Update product information and inventory."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {mode === "create" ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* General information */}
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-semibold">General information</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Product name, URL, and description.
              </p>
            </div>

            <div className="space-y-5">
              <FormField
                label="Product name"
                required
                error={errors.name?.message}
              >
                <input
                  {...register("name")}
                  placeholder="e.g. Premium Wireless Headphones"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Product slug"
                required
                error={errors.slug?.message}
              >
                <div className="relative">
                  <input
                    {...register("slug", {
                      onChange: () => {
                        slugManuallyChanged.current = true;
                      },
                    })}
                    placeholder="premium-wireless-headphones"
                    className={inputClass}
                  />
                </div>
              </FormField>

              <FormField
                label="Description"
                required
                error={errors.description?.message}
              >
                <textarea
                  {...register("description")}
                  placeholder="Describe your product..."
                  className={textareaClass}
                />
              </FormField>
            </div>
          </section>

          {/* Media */}
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Product images</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {images.length}/10
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload up to 10 images. Each image can be up to 5 MB.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
                >
                  <ImagePreview
                    images={[image.url]}
                    alt={productName || "Product image"}
                    className="size-full"
                    disabled={isPending}
                  />

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                      Main image
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    disabled={isPending}
                    aria-label="Remove image"
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-black/65 text-white opacity-100 transition hover:bg-destructive sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}

              {images.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/20 text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  <ImagePlus className="size-7" />
                  <span className="text-xs font-medium">Add images</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => {
                addImages(event.target.files);
                event.target.value = "";
              }}
            />

            {imageError && (
              <p className="mt-3 text-sm font-medium text-destructive">
                {imageError}
              </p>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
              <Upload className="mt-0.5 size-4 shrink-0" />
              <p>
                Supported image uploads are processed and stored by the backend.
                When replacing existing images, the new upload set replaces the
                previous set.
              </p>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-semibold">Pricing</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set the selling price and optional original price.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Selling price"
                required
                error={errors.price?.message}
              >
                <input
                  {...register("price")}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Compare-at price"
                error={errors.compareAtPrice?.message}
              >
                <input
                  {...register("compareAtPrice")}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className={inputClass}
                />
              </FormField>
            </div>

            {discount > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600">
                <Sparkles className="size-4" />
                Customers will see a {discount}% discount.
              </div>
            )}
          </section>

          {/* Inventory */}
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-semibold">Inventory</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage product identification and stock.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="SKU" required error={errors.sku?.message}>
                <input
                  {...register("sku")}
                  placeholder="PROD-001"
                  className={inputClass}
                  onChange={(event) => {
                    event.target.value = event.target.value.toUpperCase();

                    setValue("sku", event.target.value, {
                      shouldValidate: true,
                    });
                  }}
                />
              </FormField>

              <FormField
                label="Stock quantity"
                required
                error={errors.stock?.message}
              >
                <input
                  {...register("stock")}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  className={inputClass}
                />
              </FormField>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Organization</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Assign this product to a category.
            </p>

            <div className="mt-5">
              <FormField
                label="Category"
                required
                error={errors.category?.message}
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      disabled={categoriesLoading || isPending}
                      className={inputClass}
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Loading categories..."
                          : "Select a category"}
                      </option>

                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </FormField>

              {!categoriesLoading && categories.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No active categories found. Create an active category before
                  adding a product.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Product status</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Control product visibility in the storefront.
            </p>

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => field.onChange(!field.value)}
                  className="mt-5 flex w-full items-center justify-between rounded-xl border p-3 text-left transition hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {field.value ? "Active" : "Inactive"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {field.value
                        ? "Visible in the storefront"
                        : "Hidden from the storefront"}
                    </p>
                  </div>

                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      field.value ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${
                        field.value ? "left-6" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              )}
            />
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Product preview</h2>

            <div className="mt-4 overflow-hidden rounded-xl border">
              <div className="aspect-[4/3] bg-muted">
                {images[0] ? (
                  <ImagePreview
                    images={images.map((item) => item.url)}
                    alt={productName || "Product preview"}
                    className="size-full"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImagePlus className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-semibold">
                  {productName || "Product name"}
                </p>

                <p className="text-sm font-bold">
                  {Number(price || 0).toFixed(2)}
                </p>

                <p className="text-xs text-muted-foreground">
                  {Number(watch("stock") || 0)} units available
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="flex justify-end gap-2 border-t pt-5">
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-xl border px-4 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending || categoriesLoading || categories.length === 0}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
