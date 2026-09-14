import { z } from "zod";

import { optional, paginationSchema } from "@/lib/validation/helpers";

export const contactInputSchema = z.object({
  companyId: optional(z.string().min(1)),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  role: optional(z.string().trim().max(120, "Role must be 120 characters or fewer.")),
  email: optional(z.email("Enter a valid email address.").toLowerCase()),
  linkedinUrl: optional(z.url("Enter a valid LinkedIn URL.")),
});

export const contactUpdateSchema = contactInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Provide at least one field to update." },
);

export const contactListQuerySchema = paginationSchema.extend({
  q: optional(z.string().trim().max(120)),
  companyId: optional(z.string().min(1)),
});

export const applicationContactSchema = z.object({
  contactId: z.string().min(1, "Contact is required."),
  relationshipType: optional(z.string().trim().max(80)),
});

export type ContactInput = z.output<typeof contactInputSchema>;
export type ContactUpdateInput = z.output<typeof contactUpdateSchema>;
export type ContactListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  companyId?: string;
};
