import { api } from "@/lib/api/axios";

import type {
  AdminListParams,
  AdminListResponse,
  CreateAdminInput,
  ManagedAdmin,
  UpdateAdminInput,
} from "../types/admin.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const adminManagementApi = {
  async list(params: AdminListParams) {
    const response = await api.get<ApiResponse<AdminListResponse>>("/admin", {
      params,
    });

    return response.data.data;
  },

  async create(payload: CreateAdminInput) {
    const response = await api.post<ApiResponse<ManagedAdmin>>(
      "/admin",
      payload,
    );

    return response.data.data;
  },

  async update(id: string, payload: UpdateAdminInput) {
    const response = await api.patch<ApiResponse<ManagedAdmin>>(
      `/admin/${id}`,
      payload,
    );

    return response.data.data;
  },

  async remove(id: string) {
    await api.delete(`/admin/${id}`);
  },
};