import { api } from "@/lib/api/axios";
import type { PaymentListParams, PaymentListResult, PaymentOrderDetails } from "../types/payment.types";

type ApiResponse<T> = { success: boolean; data: T };

// The current backend has no dedicated admin payments endpoint. Read-only payment
// information is sourced from the existing admin orders endpoints.
export const paymentManagementApi = {
  async list(params: PaymentListParams) {
    const response = await api.get<ApiResponse<PaymentListResult>>("/orders/admin", { params });
    return response.data.data;
  },
  async details(orderId: string) {
    const response = await api.get<ApiResponse<PaymentOrderDetails>>(`/orders/admin/${orderId}`);
    return response.data.data;
  },
};
