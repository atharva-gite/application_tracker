import { afterEach, describe, expect, it, vi } from "vitest";

import { assertDevSeed } from "../../prisma/seed";

describe("assertDevSeed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses to run in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => assertDevSeed()).toThrow(/NODE_ENV=production/);
  });

  it("allows a local seed", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(() => assertDevSeed()).not.toThrow();
  });
});
