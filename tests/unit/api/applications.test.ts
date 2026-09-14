import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/authorization/require-user", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/server/services/application-service", () => ({
  listApplications: vi.fn(),
  getApplication: vi.fn(),
  getApplicationHistory: vi.fn(),
}));

import { GET as listGet } from "@/app/api/applications/route";
import { GET as detailGet } from "@/app/api/applications/[id]/route";
import { GET as historyGet } from "@/app/api/applications/[id]/history/route";
import { AppError, ErrorCode } from "@/lib/errors";
import { requireUser } from "@/server/authorization/require-user";
import {
  getApplication,
  getApplicationHistory,
  listApplications,
} from "@/server/services/application-service";

describe("application API authorization", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockReset();
    vi.mocked(getApplication).mockReset();
    vi.mocked(getApplicationHistory).mockReset();
    vi.mocked(listApplications).mockReset();
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

  it("lists applications for the signed-in user only", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-a",
      email: "a@example.com",
    });
    vi.mocked(listApplications).mockResolvedValue({
      applications: [{ id: "app-a", roleTitle: "Intern" }],
      page: 1,
      pageSize: 20,
      total: 1,
    } as never);

    const response = await listGet(
      new Request("http://localhost:3000/api/applications?q=intern&status=APPLIED"),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(listApplications).toHaveBeenCalledWith(
      "user-a",
      expect.objectContaining({ q: "intern", status: "APPLIED" }),
    );
    expect(body.applications).toEqual([{ id: "app-a", roleTitle: "Intern" }]);
  });

  it("returns the owner's application", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-a",
      email: "a@example.com",
    });
    vi.mocked(getApplication).mockResolvedValue({
      id: "app-a",
      roleTitle: "Intern",
      status: "SAVED",
    } as never);

    const response = await detailGet(
      new Request("http://localhost:3000/api/applications/app-a"),
      { params: Promise.resolve({ id: "app-a" }) },
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.application.id).toBe("app-a");
  });

  it("returns not found for a missing application", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-a",
      email: "a@example.com",
    });
    vi.mocked(getApplication).mockRejectedValue(
      new AppError("NOT_FOUND", "Application not found."),
    );

    const response = await detailGet(
      new Request("http://localhost:3000/api/applications/missing"),
      { params: Promise.resolve({ id: "missing" }) },
    );
    expect(response.status).toBe(404);
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

  it("hides another user's status history as not found", async () => {
    vi.mocked(requireUser).mockResolvedValue({
      id: "user-a",
      email: "a@example.com",
    });
    vi.mocked(getApplicationHistory).mockRejectedValue(
      new AppError("NOT_FOUND", "Application not found."),
    );

    const response = await historyGet(
      new Request("http://localhost:3000/api/applications/app-b/history"),
      { params: Promise.resolve({ id: "app-b" }) },
    );
    expect(response.status).toBe(404);
  });
});
