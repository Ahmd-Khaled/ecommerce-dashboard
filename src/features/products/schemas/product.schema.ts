import { z } from "zod";

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must contain at least 2 characters")
      .max(150),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .max(180)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens only",
      ),

    description: z
      .string()
      .trim()
      .min(10, "Description must contain at least 10 characters")
      .max(5000),

    sku: z
      .string()
      .trim()
      .toUpperCase()
      .min(3)
      .max(100)
      .regex(
        /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
        "Use uppercase letters, numbers, and hyphens only",
      ),

    price: z.coerce.number().finite().min(0),

    compareAtPrice: z
      .union([z.coerce.number().finite().min(0), z.literal("")])
      .optional(),

    stock: z.coerce.number().int().min(0),

    category: z.string().min(1, "Please select a category"),

    isActive: z.boolean(),

  })
  .refine(
    (data) => {
      if (
        data.compareAtPrice === undefined ||
        data.compareAtPrice === ""
      ) {
        return true;
      }

      return Number(data.compareAtPrice) > data.price;
    },
    {
      path: ["compareAtPrice"],
      message: "Compare-at price must be greater than the current price",
    },
  );

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;
