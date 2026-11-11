export enum CustomerRoleEnum {
  USER = "user",
  GUEST = "guest",
}

export type CustomerRole = CustomerRoleEnum;
export type CustomerStatus = "active" | "pending" | "frozen" | "deleted";

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: CustomerRole;
  status: CustomerStatus;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerListParams = {
  page: number;
  limit: number;
  search?: string;
  role?: CustomerRole;
  status?: CustomerStatus;
};

export type CustomerPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CustomerListResult = {
  users: Customer[];
  pagination: CustomerPagination;
};

export type CreateCustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: CustomerRole;
};

export type UpdateCustomerInput = {
  firstName?: string;
  lastName?: string;
  role?: CustomerRole;
  status?: Exclude<CustomerStatus, "deleted" | "pending">;
};