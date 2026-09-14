import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { applicationCreateSchema } from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { createApplication, getApplication } from "@/server/services/application-service";
import { registerUser } from "@/server/services/auth-service";

describe("application service", () => {
  it("stores status history and isolates users", async (context) => {
    try {
      await prisma.$connect();
    } catch {
      context.skip();
      return;
    }

    const suffix = Date.now();
    const owner = await registerUser({
      name: "Owner",
      email: `owner-${suffix}@example.com`,
      password: "password12",
    });
    const other = await registerUser({
      name: "Other",
      email: `other-${suffix}@example.com`,
      password: "password12",
    });

    const application = await createApplication(
      owner.id,
      parseSchema(applicationCreateSchema, {
        companyName: "Google",
        roleTitle: "Software Engineering Intern",
        status: "SAVED",
      }),
    );

    expect(application.company.name).toBe("Google");
    expect(application.status).toBe("SAVED");

    const history = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: application.id },
    });
    expect(history).toHaveLength(1);
    expect(history[0]?.fromStatus).toBeNull();
    expect(history[0]?.toStatus).toBe("SAVED");

    await expect(getApplication(other.id, application.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
