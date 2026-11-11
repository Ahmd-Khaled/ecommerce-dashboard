
import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters")
    .max(100),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only",
    ),

  description: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal("")),

  parent: z.string().optional(),

  isActive: z.boolean(),

  sortOrder: z.coerce.number().int().min(0),

  imageFile: z
    .custom<File>((value) => value instanceof File)
    .nullable()
    .optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
