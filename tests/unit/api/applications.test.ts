import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/authorization/require-user", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/server/services/application-service", () => ({
  listApplications: vi.fn(),
  getApplication: vi.fn(),
}));

import { GET as listGet } from "@/app/api/applications/route";
import { GET as detailGet } from "@/app/api/applications/[id]/route";
import { AppError, ErrorCode } from "@/lib/errors";
import { requireUser } from "@/server/authorization/require-user";
import { getApplication } from "@/server/services/application-service";

describe("application API authorization", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockReset();
    vi.mocked(getApplication).mockReset();
  });

  it("rejects unauthenticated list requests", async () => {
    vi.mocked(requireUser).mockRejectedValue(
      new AppError("UNAUTHORIZED", "You need to sign in to continue."),
    );

    const response = await listGet(
      new Request("http://localhost:3000/api/applications"),
    );
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it("hides another user's application as not found", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-a",
      email: "a@example.com",
    });
    vi.mocked(getApplication).mockRejectedValue(
      new AppError("NOT_FOUND", "Application not found."),
    );

    const response = await detailGet(
      new Request("http://localhost:3000/api/applications/app-b"),
      { params: Promise.resolve({ id: "app-b" }) },
    );
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.error.code).toBe(ErrorCode.NOT_FOUND);
  });
});
