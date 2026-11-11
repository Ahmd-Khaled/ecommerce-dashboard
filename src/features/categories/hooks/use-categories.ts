
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import { categoriesApi } from "../api/categories.api";

import type {
  CategoryPayload,
} from "../types/category.types";

export const categoriesQueryKey = ["categories"] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: categoriesApi.getCategories,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [...categoriesQueryKey, "detail", id],
    queryFn: () => categoriesApi.getCategory(id),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) =>
      categoriesApi.createCategory(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKey,
      });

      toast.success("Category created successfully");
    },

    onError: () => {
      toast.error("Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CategoryPayload;
    }) => categoriesApi.updateCategory(id, payload),

    onSuccess: async (category) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriesQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: [
            ...categoriesQueryKey,
            "detail",
            category._id,
          ],
        }),
      ]);

      toast.success("Category updated successfully");
    },

    onError: () => {
      toast.error("Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      categoriesApi.deleteCategory(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKey,
      });

      toast.success("Category deleted successfully");
    },

    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "message" in error.response.data &&
          typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Cannot delete this category";

      toast.error(message);
    },
  });
}
