import { api } from "@/lib/api/axios";

import type {
  Order,
  OrderFilters,
  OrderListResult,
  UpdateOrderStatusPayload,
} from "../types/order.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const ordersApi = {
  async list(filters: OrderFilters): Promise<OrderListResult> {
    const { data } = await api.get<ApiResponse<OrderListResult>>(
      "/orders/admin",
      {
        params: filters,
      },
    );

    return data.data;
  },

  async details(orderId: string): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(
      `/orders/admin/${orderId}`,
    );

    return data.data;
  },

  async updateStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<Order> {
    const { data } = await api.patch<ApiResponse<Order>>(
      `/orders/admin/${orderId}/status`,
      payload,
    );

    return data.data;
  },
};