import { AppError } from "@/lib/errors";

export function assertOwnedBy(
  resourceUserId: string,
  actorUserId: string,
  message = "Resource not found.",
) {
  if (resourceUserId !== actorUserId) {
    throw new AppError("NOT_FOUND", message);
  }
}
