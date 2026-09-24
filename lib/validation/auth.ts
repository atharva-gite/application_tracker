import { z } from "zod";

import { isValidTimeZone } from "@/lib/timezone";
import { parseSchema } from "@/lib/validation/helpers";

export { parseSchema };

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
  timezone: z.string().trim().min(1).max(64).optional(),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name must be 80 characters or fewer."),
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required.")
    .max(64, "Timezone must be 64 characters or fewer.")
    .refine(isValidTimeZone, "Choose a valid timezone."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
