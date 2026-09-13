"use server";

import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import {
  forgotPasswordSchema,
  loginSchema,
  parseSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import {
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "@/server/services/auth-service";

export type AuthFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function toFormState(error: unknown): AuthFormState {
  if (error instanceof AppError) {
    const fieldErrors =
      error.code === "VALIDATION_ERROR" &&
      error.details &&
      typeof error.details === "object"
        ? (error.details as Record<string, string[] | undefined>)
        : undefined;

    return {
      message: error.message,
      fieldErrors,
    };
  }

  return { message: "Something went wrong. Please try again." };
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const input = parseSchema(registerSchema, {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await registerUser(input);
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });
  } catch (error) {
    return toFormState(error);
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const input = parseSchema(loginSchema, {
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return toFormState(error);
    }
    return {
      message: "Invalid email or password.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const input = parseSchema(forgotPasswordSchema, {
      email: formData.get("email"),
    });
    const result = await requestPasswordReset(input);
    return { message: result.message };
  } catch (error) {
    return toFormState(error);
  }
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const input = parseSchema(resetPasswordSchema, {
      token: formData.get("token"),
      password: formData.get("password"),
    });
    await resetPassword(input);
  } catch (error) {
    return toFormState(error);
  }

  redirect("/login?reset=1");
}
