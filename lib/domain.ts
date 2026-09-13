import { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors";

export function publicUser(user: {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
  };
}

export function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function notFound(message = "Resource not found.") {
  return new AppError("NOT_FOUND", message);
}
