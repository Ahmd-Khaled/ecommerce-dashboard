import type { AdminRole } from "@/features/admin-management/types/admin.types";

export type { AdminRole } from "@/features/admin-management/types/admin.types";

export type AdminStatus = "active" | "frozen" | "deleted";

export interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: AdminRole;
  status?: AdminStatus;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTokens {
  accessToken: string;
  tokenType?: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  admin: Admin;
  tokens: AdminTokens;
}

export interface AdminProfileResponse {
  success: boolean;
  admin: Admin;
}

export interface AdminMessageResponse {
  success: boolean;
  message: string;
}
