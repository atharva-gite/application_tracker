import { afterEach, describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import { assertRateLimit, resetRateLimitForTests } from "@/lib/rate-limit";

describe("assertRateLimit", () => {
  afterEach(() => {
    resetRateLimitForTests();
  });

  it("allows requests under the limit", () => {
    expect(() =>
      assertRateLimit({ key: "login:test", limit: 3, windowMs: 60_000 }),
    ).not.toThrow();
    expect(() =>
      assertRateLimit({ key: "login:test", limit: 3, windowMs: 60_000 }),
    ).not.toThrow();
  });

  it("blocks repeated login attempts", () => {
    const options = { key: "login:same", limit: 2, windowMs: 60_000 };
    assertRateLimit(options);
    assertRateLimit(options);
    expect(() => assertRateLimit(options)).toThrow(AppError);
    try {
      assertRateLimit(options);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("RATE_LIMITED");
      expect((error as AppError).status).toBe(429);
    }
  });
});
