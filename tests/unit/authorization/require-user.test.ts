import { describe, expect, it } from "vitest";

import { assertOwnedBy } from "@/server/authorization/ownership";
import { AppError } from "@/lib/errors";

describe("ownership checks", () => {
  it("allows access when the actor owns the resource", () => {
    expect(() => assertOwnedBy("user-1", "user-1")).not.toThrow();
  });

  it("hides another user's resource as not found", () => {
    try {
      assertOwnedBy("user-a", "user-b");
      throw new Error("expected authorization failure");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("NOT_FOUND");
      expect((error as AppError).status).toBe(404);
    }
  });
});
