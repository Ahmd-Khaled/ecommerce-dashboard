export enum AdminRoleEnum {
  ADMIN = "admin",
  SUPER_ADMIN = "super-admin",
}

export type AdminRole = AdminRoleEnum;
export type AdminStatus = "active" | "frozen" | "deleted";

export type ManagedAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminListParams = {
  page: number;
  limit: number;
  search?: string;
  role?: AdminRole;
  status?: AdminStatus;
};

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminListResponse = {
  admins: ManagedAdmin[];
  pagination: AdminPagination;
};

export type CreateAdminInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminRole;
};

export type UpdateAdminInput = {
  firstName?: string;
  lastName?: string;
  role?: AdminRole;
  status?: Exclude<AdminStatus, "deleted">;
};
