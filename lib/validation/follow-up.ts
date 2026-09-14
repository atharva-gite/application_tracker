import { FollowUpType } from "@prisma/client";
import { z } from "zod";

import { dateTimeSchema, optional } from "@/lib/validation/helpers";

export const FOLLOW_UP_TYPES = [
  "RECRUITER",
  "THANK_YOU",
  "STATUS_CHECK",
  "OTHER",
] as const satisfies readonly FollowUpType[];

export const followUpInputSchema = z.object({
  dueAt: dateTimeSchema,
  type: z.enum(FOLLOW_UP_TYPES),
  note: optional(
    z.string().trim().max(2000, "Note must be 2000 characters or fewer."),
  ),
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
