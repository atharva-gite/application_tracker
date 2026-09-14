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

export function isForeignKeyError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}

export function notFound(message = "Resource not found.") {
  return new AppError("NOT_FOUND", message);
}

export function normalizeCompanyName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(value: Date | null | undefined) {
  if (!value) {
    return null;
  }
  return value.toISOString().slice(0, 10);
}

export function formatDateTime(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}
