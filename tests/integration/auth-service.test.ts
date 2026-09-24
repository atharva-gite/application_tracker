import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { PRODUCT_EVENTS } from "@/lib/product-events";
import { registerUser, verifyCredentials } from "@/server/services/auth-service";

describe("auth service", () => {
  it("creates a user owned by the provided email and verifies credentials", async (context) => {
    try {
      await prisma.$connect();
    } catch {
      context.skip();
      return;
    }

    const email = `phase1-${Date.now()}@example.com`;

    const user = await registerUser({
      name: "Test User",
      email,
      password: "password12",
    });

    expect(user.email).toBe(email);
    expect(user).not.toHaveProperty("passwordHash");
    expect(
      await prisma.productEvent.count({
        where: { userId: user.id, name: PRODUCT_EVENTS.signupCompleted },
      }),
    ).toBe(1);

    const stored = await prisma.user.findUnique({ where: { id: user.id } });
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toBe("password12");

    const verified = await verifyCredentials({
      email,
      password: "password12",
    });
    expect(verified?.id).toBe(user.id);

    const rejected = await verifyCredentials({
      email,
      password: "wrong-password",
    });
    expect(rejected).toBeNull();
  });
});
