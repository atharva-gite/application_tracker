import {
  InterviewOutcome,
  InterviewStatus,
  InterviewType,
} from "@prisma/client";
import { z } from "zod";

import { dateTimeSchema, optional } from "@/lib/validation/helpers";

export const INTERVIEW_TYPES = [
  "PHONE_SCREEN",
  "TECHNICAL",
  "BEHAVIORAL",
  "SYSTEM_DESIGN",
  "ONSITE",
  "OTHER",
] as const satisfies readonly InterviewType[];

export const INTERVIEW_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const satisfies readonly InterviewStatus[];

export const INTERVIEW_OUTCOMES = [
  "PENDING",
  "ADVANCED",
  "REJECTED",
  "WITHDRAWN",
] as const satisfies readonly InterviewOutcome[];

export const interviewInputSchema = z.object({
  scheduledAt: dateTimeSchema,
  durationMinutes: optional(z.coerce.number().int().min(5).max(12 * 60)),
  type: z.enum(INTERVIEW_TYPES),
  interviewerName: optional(
    z.string().trim().max(120, "Interviewer name must be 120 characters or fewer."),
  ),
  meetingUrl: optional(z.url("Enter a valid meeting URL.")),
  status: z.enum(INTERVIEW_STATUSES).default("SCHEDULED"),
  outcome: optional(z.enum(INTERVIEW_OUTCOMES)),
  notes: optional(
    z.string().trim().max(8000, "Notes must be 8000 characters or fewer."),
  ),
});

export const interviewUpdateSchema = interviewInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Provide at least one field to update." },
);

export type InterviewInput = z.output<typeof interviewInputSchema>;
export type InterviewUpdateInput = z.output<typeof interviewUpdateSchema>;
