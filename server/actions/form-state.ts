import { AppError } from "@/lib/errors";

export type FormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function toFormState(error: unknown): FormState {
  if (error instanceof AppError) {
    const fieldErrors =
      error.code === "VALIDATION_ERROR" &&
      error.details &&
      typeof error.details === "object"
        ? (error.details as Record<string, string[] | undefined>)
        : undefined;
    return { message: error.message, fieldErrors };
  }
  return { message: "Something went wrong. Please try again." };
}

export function formObject(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()]
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .filter(([, value]) => value !== ""),
  );
}
