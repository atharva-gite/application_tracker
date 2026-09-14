import { z } from "zod";

import { optional, paginationSchema } from "@/lib/validation/helpers";

export const companyInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Company name is required.")
    .max(120, "Company name must be 120 characters or fewer."),
  website: optional(z.url("Enter a valid website URL.")),
  industry: optional(
    z.string().trim().max(80, "Industry must be 80 characters or fewer."),
  ),
  location: optional(
    z.string().trim().max(120, "Location must be 120 characters or fewer."),
  ),
  notes: optional(
    z.string().trim().max(5000, "Notes must be 5000 characters or fewer."),
  ),
});

export const companyUpdateSchema = companyInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Provide at least one field to update." },
);

export const companyListQuerySchema = paginationSchema.extend({
  q: optional(z.string().trim().max(120)),
});

export type CompanyInput = z.output<typeof companyInputSchema>;
export type CompanyUpdateInput = z.output<typeof companyUpdateSchema>;
export type CompanyListQuery = {
  page: number;
  pageSize: number;
  q?: string;
};
