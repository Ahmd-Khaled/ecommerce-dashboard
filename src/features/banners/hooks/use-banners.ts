"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bannersApi } from "../api/banners.api";
import type { BannerFilters, BannerPayload } from "../types/banner.types";

export const bannersQueryKey = ["banners"] as const;

export function useBanners(filters: BannerFilters) {
  return useQuery({ queryKey: [...bannersQueryKey, filters], queryFn: () => bannersApi.list(filters) });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BannerPayload) => bannersApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bannersQueryKey });
      toast.success("Banner created successfully");
    },
    onError: () => toast.error("Failed to create banner"),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BannerPayload }) => bannersApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bannersQueryKey });
      toast.success("Banner updated successfully");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update banner"),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bannersQueryKey });
      toast.success("Banner deleted successfully");
    },
    onError: () => toast.error("Failed to delete banner"),
  });
}
