
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "../api/payments.api";
import type { PaymentOrdersParams } from "../types/payment.types";

export const paymentsKeys = {
  all: ["payments-management"] as const,

  list: (params: PaymentOrdersParams) =>
    [...paymentsKeys.all, "list", params] as const,

  details: (orderId: string) =>
    [...paymentsKeys.all, "details", orderId] as const,
};

export function usePaymentOrders(params: PaymentOrdersParams) {
  return useQuery({
    queryKey: paymentsKeys.list(params),
    queryFn: () => paymentsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePaymentOrderDetails(
  orderId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: paymentsKeys.details(orderId),
    queryFn: () => paymentsApi.details(orderId),
    enabled: enabled && Boolean(orderId),
  });
}
