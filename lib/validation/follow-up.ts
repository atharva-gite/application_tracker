import { FollowUpType } from "@prisma/client";
import { z } from "zod";

import { optional } from "@/lib/validation/helpers";

export const FOLLOW_UP_TYPES = [
  "RECRUITER",
  "THANK_YOU",
  "STATUS_CHECK",
  "HIRING_MANAGER",
  "OTHER",
] as const satisfies readonly FollowUpType[];

export const followUpDateTimeSchema = z
  .string()
  .trim()
  .min(1, "Date and time are required.")
  .refine((value) => {
    const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
      ? `${value}:00`
      : value;
    const parseable =
      /[zZ]$/.test(normalized) || /[+-]\d{2}:\d{2}$/.test(normalized)
        ? normalized
        : `${normalized}Z`;
    return !Number.isNaN(Date.parse(parseable));
  }, "Enter a valid date and time.");

export const followUpInputSchema = z.object({
  dueAt: followUpDateTimeSchema,
  type: z.enum(FOLLOW_UP_TYPES),
  note: optional(
    z.string().trim().max(2000, "Note must be 2000 characters or fewer."),
  ),
  timeZone: optional(z.string().trim().min(1).max(64)),
});

export const followUpUpdateSchema = followUpInputSchema
  .partial()
  .extend({
    completed: optional(z.coerce.boolean()),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

export type FollowUpInput = z.output<typeof followUpInputSchema>;
export type FollowUpUpdateInput = z.output<typeof followUpUpdateSchema>;
