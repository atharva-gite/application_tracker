import { notFound } from "next/navigation";

import { AppError } from "@/lib/errors";

export async function loadOrNotFound<T>(loader: () => Promise<T>): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
