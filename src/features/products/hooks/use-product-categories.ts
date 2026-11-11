"use client";

import { useQuery } from "@tanstack/react-query";

import { productCategoriesApi } from "../api/product-categories.api";

export const productCategoriesQueryKey = ["product-categories"];

export function useProductCategories() {
  return useQuery({
    queryKey: productCategoriesQueryKey,
    queryFn: productCategoriesApi.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}