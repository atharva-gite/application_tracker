import { describe, expect, it } from "vitest";

import { handleApi } from "@/lib/api";
import { AppError, ErrorCode } from "@/lib/errors";

describe("handleApi", () => {
  it("returns JSON for invalid request bodies", async () => {
    const response = await handleApi(
      new Request("http://localhost:3000/api/applications", { method: "POST" }),
      async () => {
        throw new AppError("VALIDATION_ERROR", "Request body must be valid JSON.");
      },
    );
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("hides unexpected failures as INTERNAL_ERROR", async () => {
    const response = await handleApi(
      new Request("http://localhost:3000/api/hidden"),
      async () => {
        throw new Error("prisma blowup with table users");
      },
    );
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(JSON.stringify(body)).not.toContain("prisma");
    expect(JSON.stringify(body)).not.toContain("stack");
  });

  it("maps conflict errors", async () => {
    const response = await handleApi(
      new Request("http://localhost:3000/api/companies"),
      async () => {
        throw new AppError("CONFLICT", "You already have a company with this name.");
      },
    );
    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe(ErrorCode.CONFLICT);
  });
});
