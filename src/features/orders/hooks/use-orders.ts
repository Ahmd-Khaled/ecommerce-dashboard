"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api/axios";

import { ordersApi } from "../api/orders.api";

import type {
  OrderFilters,
  UpdateOrderStatusPayload,
} from "../types/order.types";

export const ordersQueryKeys = {
  all: ["orders"] as const,

  lists: () => [...ordersQueryKeys.all, "list"] as const,

  list: (filters: OrderFilters) =>
    [...ordersQueryKeys.lists(), filters] as const,

  details: () => [...ordersQueryKeys.all, "details"] as const,

  detail: (id: string) =>
    [...ordersQueryKeys.details(), id] as const,
};

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ordersQueryKeys.list(filters),
    queryFn: () => ordersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useOrderDetails(
  orderId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ordersQueryKeys.detail(orderId),
    queryFn: () => ordersApi.details(orderId),
    enabled: enabled && Boolean(orderId),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateOrderStatusPayload;
    }) => ordersApi.updateStatus(orderId, payload),

    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ordersQueryKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: ordersQueryKeys.detail(order._id),
        }),
      ]);

      toast.success("Order status updated successfully");
    },

    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
}