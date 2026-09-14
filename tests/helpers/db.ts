import { prisma } from "@/lib/prisma";
import { applicationCreateSchema } from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { createApplication } from "@/server/services/application-service";
import { registerUser } from "@/server/services/auth-service";

let dbAvailable: boolean | null = null;

export async function ensureDatabase(context: { skip: () => void }) {
  if (dbAvailable === null) {
    try {
      await prisma.$connect();
      dbAvailable = true;
    } catch {
      dbAvailable = false;
    }
  }
  if (!dbAvailable) {
    context.skip();
  }
}

export function uniqueEmail(prefix = "user") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function createTestUser(name = "Test User") {
  return registerUser({
    name,
    email: uniqueEmail(name.toLowerCase().replace(/\s+/g, "-")),
    password: "password12",
  });
}

export async function createTestApplication(
  userId: string,
  overrides: Record<string, unknown> = {},
) {
  return createApplication(
    userId,
    parseSchema(applicationCreateSchema, {
      companyName: "Acme",
      roleTitle: "Software Engineering Intern",
      status: "SAVED",
      ...overrides,
    }),
  );
}
