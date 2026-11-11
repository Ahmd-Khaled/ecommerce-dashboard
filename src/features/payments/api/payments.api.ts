
import { api } from "@/lib/api/axios";

import type {
  PaymentOrder,
  PaymentOrdersParams,
  PaymentOrdersResponse,
} from "../types/payment.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const paymentsApi = {
  async list(params: PaymentOrdersParams): Promise<PaymentOrdersResponse> {
    const { data } = await api.get<ApiResponse<PaymentOrdersResponse>>(
      "/orders/admin",
      { params },
    );

    return data.data;
  },

  async details(orderId: string): Promise<PaymentOrder> {
    const { data } = await api.get<ApiResponse<PaymentOrder>>(
      `/orders/admin/${orderId}`,
    );

    return data.data;
  },
};
