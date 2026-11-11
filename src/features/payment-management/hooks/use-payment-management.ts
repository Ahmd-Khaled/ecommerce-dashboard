"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paymentManagementApi } from "../api/payment-management.api";
import type { PaymentListParams } from "../types/payment.types";

export const paymentManagementKeys = {
  all: ["payment-management"] as const,
  list: (params: PaymentListParams) => ["payment-management", "list", params] as const,
  details: (id: string) => ["payment-management", "details", id] as const,
};

export function usePaymentOrders(params: PaymentListParams) {
  return useQuery({ queryKey: paymentManagementKeys.list(params), queryFn: () => paymentManagementApi.list(params), placeholderData: keepPreviousData });
}

export function usePaymentOrderDetails(id: string, enabled = true) {
  return useQuery({ queryKey: paymentManagementKeys.details(id), queryFn: () => paymentManagementApi.details(id), enabled: enabled && Boolean(id) });
}
