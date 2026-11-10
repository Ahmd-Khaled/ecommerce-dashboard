import { api } from "@/lib/api/axios";

import type {
  Admin,
  AdminLoginInput,
  AdminLoginResponse,
  AdminMessageResponse,
  AdminProfileResponse,
} from "../types/admin-auth.types";

export const adminAuthApi = {
  async login(input: AdminLoginInput): Promise<AdminLoginResponse> {
    const { data } = await api.post<AdminLoginResponse>(
      "/admin/auth/login",
      input,
    );

    return data;
  },

  async refresh(): Promise<string> {
    const { refreshAdminAccessToken } = await import("@/lib/api/axios");

    return refreshAdminAccessToken();
  },

  async profile(): Promise<Admin> {
    const { data } = await api.get<AdminProfileResponse>(
      "/admin/auth/profile",
    );

    return data.admin;
  },

  async logout(): Promise<void> {
    await api.post<AdminMessageResponse>("/admin/auth/logout", {});
  },

  async logoutAll(): Promise<void> {
    await api.post("/admin/auth/logout-all");
  },

  async updateProfile(input: {
    firstName?: string;
    lastName?: string;
  }): Promise<Admin> {
    const { data } = await api.patch<AdminProfileResponse>(
      "/admin/auth/profile",
      input,
    );

    return data.admin;
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.patch("/admin/auth/change-password", input);
  },
};