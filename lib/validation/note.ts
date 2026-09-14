import { z } from "zod";

import { optional } from "@/lib/validation/helpers";

export const noteInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Note cannot be empty.")
    .max(8000, "Note must be 8000 characters or fewer."),
});

export const noteUpdateSchema = z.object({
  content: optional(noteInputSchema.shape.content),
}).refine((value) => Object.keys(value).length > 0, {
  message: "Provide at least one field to update.",
});

export type NoteInput = z.infer<typeof noteInputSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
