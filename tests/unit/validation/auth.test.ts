import { describe, expect, it } from "vitest";

import { parseSchema, registerSchema, loginSchema } from "@/lib/validation/auth";
import { AppError } from "@/lib/errors";

describe("auth validation", () => {
  it("accepts a valid registration payload", () => {
    const data = parseSchema(registerSchema, {
      name: "Alex Student",
      email: "Alex@University.EDU",
      password: "securepass",
    });

    expect(data.email).toBe("alex@university.edu");
    expect(data.name).toBe("Alex Student");
  });

  it("rejects a short password", () => {
    expect(() =>
      parseSchema(registerSchema, {
        name: "Alex",
        email: "alex@university.edu",
        password: "short",
      }),
    ).toThrow(AppError);
  });

  it("rejects an invalid email", () => {
    try {
      parseSchema(loginSchema, { email: "not-an-email", password: "password" });
      throw new Error("expected validation failure");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("VALIDATION_ERROR");
    }
  });
});
