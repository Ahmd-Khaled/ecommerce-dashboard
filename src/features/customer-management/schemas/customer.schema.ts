import { z } from "zod";
import { CustomerRoleEnum } from "../types/customer.types";

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(CustomerRoleEnum),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  role: z.enum(CustomerRoleEnum),
});

export type CreateCustomerFormValues = z.infer<
  typeof createCustomerSchema
>;

export type UpdateCustomerFormValues = z.infer<
  typeof updateCustomerSchema
>;
