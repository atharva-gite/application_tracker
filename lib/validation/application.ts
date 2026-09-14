import { EmploymentType, ApplicationStatus } from "@prisma/client";
import { z } from "zod";

import { optional, dateOnlySchema, paginationSchema } from "@/lib/validation/helpers";

export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const satisfies readonly ApplicationStatus[];

export const EMPLOYMENT_TYPES = [
  "INTERNSHIP",
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "OTHER",
] as const satisfies readonly EmploymentType[];

export const applicationSortFields = [
  "updatedAt",
  "createdAt",
  "deadline",
  "applicationDate",
  "roleTitle",
  "status",
] as const;

const applicationFields = {
  companyId: optional(z.string().min(1)),
  companyName: optional(
    z.string().trim().min(1).max(120, "Company name must be 120 characters or fewer."),
  ),
  companyWebsite: optional(z.url("Enter a valid website URL.")),
  roleTitle: z
    .string()
    .trim()
    .min(1, "Role title is required.")
    .max(160, "Role title must be 160 characters or fewer."),
  jobUrl: optional(z.url("Enter a valid job URL.")),
  location: optional(
    z.string().trim().max(160, "Location must be 160 characters or fewer."),
  ),
  employmentType: optional(z.enum(EMPLOYMENT_TYPES)),
  status: z.enum(APPLICATION_STATUSES).default("SAVED"),
  applicationDate: optional(dateOnlySchema),
  deadline: optional(dateOnlySchema),
  source: optional(
    z.string().trim().max(80, "Source must be 80 characters or fewer."),
  ),
  salaryMin: optional(z.coerce.number().int().min(0).max(10_000_000)),
  salaryMax: optional(z.coerce.number().int().min(0).max(10_000_000)),
  salaryCurrency: optional(z.string().trim().length(3).toUpperCase()),
  description: optional(
    z.string().trim().max(8000, "Description must be 8000 characters or fewer."),
  ),
};

function salaryRange(value: { salaryMin?: number; salaryMax?: number }) {
  if (
    value.salaryMin !== undefined &&
    value.salaryMax !== undefined &&
    value.salaryMin > value.salaryMax
  ) {
    return false;
  }
  return true;
}

export const applicationCreateSchema = z
  .object(applicationFields)
  .refine((value) => Boolean(value.companyId || value.companyName), {
    message: "Select an existing company or enter a company name.",
    path: ["companyName"],
  })
  .refine(salaryRange, {
    message: "Minimum salary cannot be greater than maximum salary.",
    path: ["salaryMin"],
  });

export const applicationUpdateSchema = z
  .object({
    ...applicationFields,
    roleTitle: optional(applicationFields.roleTitle),
    status: optional(z.enum(APPLICATION_STATUSES)),
    archived: optional(z.coerce.boolean()),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  })
  .refine(salaryRange, {
    message: "Minimum salary cannot be greater than maximum salary.",
    path: ["salaryMin"],
  });

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

export const applicationListQuerySchema = paginationSchema.extend({
  q: optional(z.string().trim().max(160)),
  status: optional(z.enum(APPLICATION_STATUSES)),
  companyId: optional(z.string().min(1)),
  location: optional(z.string().trim().max(160)),
  source: optional(z.string().trim().max(80)),
  deadlineFrom: optional(dateOnlySchema),
  deadlineTo: optional(dateOnlySchema),
  appliedFrom: optional(dateOnlySchema),
  appliedTo: optional(dateOnlySchema),
  sort: z.enum(applicationSortFields).default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  archived: optional(z.enum(["true", "false", "only"])),
  view: optional(z.enum(["list", "board"])),
});

export type ApplicationCreateInput = z.output<typeof applicationCreateSchema>;
export type ApplicationUpdateInput = z.output<typeof applicationUpdateSchema>;
export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
export type ApplicationListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  status?: (typeof APPLICATION_STATUSES)[number];
  companyId?: string;
  location?: string;
  source?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  appliedFrom?: string;
  appliedTo?: string;
  sort?: (typeof applicationSortFields)[number];
  order?: "asc" | "desc";
  archived?: "true" | "false" | "only";
  view?: "list" | "board";
};
