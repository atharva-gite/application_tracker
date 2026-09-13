import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/authorization/require-user", () => ({
  requireUser: vi.fn(),
}));

import { GET } from "@/app/api/auth/me/route";
import { AppError, ErrorCode } from "@/lib/errors";
import { requireUser } from "@/server/authorization/require-user";

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockReset();
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(requireUser).mockRejectedValue(
      new AppError("UNAUTHORIZED", "You need to sign in to continue."),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/auth/me"),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe(ErrorCode.UNAUTHORIZED);
  });
});
