import { api } from "@/lib/api/axios";

import type {
  CreateCustomerInput,
  Customer,
  CustomerListParams,
  CustomerListResult,
  UpdateCustomerInput,
} from "../types/customer.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const customerManagementApi = {
  async list(params: CustomerListParams) {
    const response = await api.get<ApiResponse<CustomerListResult>>(
      "/admin/users",
      { params },
    );

    return response.data.data;
  },

  async details(id: string) {
    const response = await api.get<ApiResponse<Customer>>(
      `/admin/users/${id}`,
    );

    return response.data.data;
  },

  async create(payload: CreateCustomerInput) {
    const response = await api.post<ApiResponse<Customer>>(
      "/admin/users",
      payload,
    );

    return response.data.data;
  },

  async update(id: string, payload: UpdateCustomerInput) {
    const response = await api.patch<ApiResponse<Customer>>(
      `/admin/users/${id}`,
      payload,
    );

    return response.data.data;
  },

  async remove(id: string) {
    await api.delete(`/admin/users/${id}`);
  },
};