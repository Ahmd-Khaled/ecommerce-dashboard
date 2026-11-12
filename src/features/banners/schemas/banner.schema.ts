import { z } from "zod";

export const bannerSchema = z.object({
  language: z.enum(["ar", "en"]),
  view: z.enum(["desktop", "mobile"]),
  title: z.string().trim().max(150),
  altText: z.string().trim().max(300),
  linkUrl: z.string().trim().max(2048).refine((value) => {
    if (!value) return true;
    if (/^\/(?!\/)/.test(value)) return !/[\\\s\u0000-\u001f]/.test(value);
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Enter a relative path or HTTP(S) URL"),
  sortOrder: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
  startsAt: z.string(),
  endsAt: z.string(),
}).superRefine((value, context) => {
  if (value.startsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after start date" });
  }
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
