import { describe, expect, it } from "vitest";

import { AppError, toErrorBody } from "@/lib/errors";

describe("API error contract", () => {
  it("serializes application errors without stack traces", () => {
    const error = new AppError("UNAUTHORIZED", "You need to sign in to continue.");
    expect(toErrorBody(error)).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "You need to sign in to continue.",
      },
    });
    expect(JSON.stringify(toErrorBody(error))).not.toContain("stack");
  });
});
