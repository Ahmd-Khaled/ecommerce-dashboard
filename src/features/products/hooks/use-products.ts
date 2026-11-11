"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { productsApi } from "../api/products.api";

import type {
  ProductFilters,
} from "../types/product.types";

import type {
  ProductFormValues,
} from "../schemas/product.schema";

interface ProductFormData extends ProductFormValues {
  imageFiles: File[];
  images: string[];
}

export const productsQueryKey = ["products"];

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: [...productsQueryKey, filters],
    queryFn: () => productsApi.getProducts(filters),
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: [...productsQueryKey, "detail", productId],
    queryFn: () => productsApi.getProduct(productId),
    enabled: Boolean(productId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductFormData) => {
      const { imageFiles, images, compareAtPrice, ...fields } = payload;

      return productsApi.createProduct({
        ...fields,
        images,
        imageFiles,
        compareAtPrice:
          compareAtPrice === "" ? undefined : compareAtPrice,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productsQueryKey,
      });

      toast.success("Product created successfully");
    },

    onError: () => {
      toast.error("Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: ProductFormData;
    }) => {
      const {
        imageFiles,
        images,
        ...fields
      } = payload;

      return productsApi.updateProduct(productId, {
        ...fields,
        images,
        imageFiles,
        compareAtPrice:
          payload.compareAtPrice === ""
            ? null
            : payload.compareAtPrice,
      });
    },

    onSuccess: async (product) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: [
            ...productsQueryKey,
            "detail",
            product._id,
          ],
        }),
      ]);

      toast.success("Product updated successfully");
    },

    onError: () => {
      toast.error("Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      productsApi.deleteProduct(productId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productsQueryKey,
      });

      toast.success("Product archived successfully");
    },

    onError: () => {
      toast.error("Failed to archive product");
    },
  });
}
