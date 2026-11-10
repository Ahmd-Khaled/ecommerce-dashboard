import { z } from "zod";

import { AdminRoleEnum } from "../types/admin.types";

export const createAdminSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(AdminRoleEnum),
});

export const updateAdminSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  role: z.enum(AdminRoleEnum),
});

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
export type UpdateAdminFormValues = z.infer<typeof updateAdminSchema>;
