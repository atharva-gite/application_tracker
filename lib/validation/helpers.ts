import { z, flattenError, type ZodTypeAny } from "zod";

import { AppError } from "@/lib/errors";

export function parseSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Please correct the highlighted fields.",
      flattenError(result.error).fieldErrors,
    );
  }
  return result.data;
}

export function optional<T extends ZodTypeAny>(schema: T) {
  return z.preprocess((value) => {
    if (value === "" || value === null) {
      return undefined;
    }
    return value;
  }, schema.optional()) as unknown as z.ZodOptional<T>;
}

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.");

export const dateTimeSchema = z
  .string()
  .trim()
  .min(1, "Date and time are required.")
  .transform((value, ctx) => {
    const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
      ? `${value}:00`
      : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "Enter a valid date and time." });
      return z.NEVER;
    }
    return date.toISOString();
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
