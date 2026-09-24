import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/authorization/require-user", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/server/services/application-csv-service", () => ({
  exportApplicationsCsv: vi.fn(),
  importApplications: vi.fn(),
}));

import { GET as exportGet } from "@/app/api/applications/export/route";
import { POST as importPost } from "@/app/api/applications/import/route";
import { AppError, ErrorCode } from "@/lib/errors";
import { resetRateLimitForTests } from "@/lib/rate-limit";
import { requireUser } from "@/server/authorization/require-user";
import {
  exportApplicationsCsv,
  importApplications,
} from "@/server/services/application-csv-service";

describe("application csv API", () => {
  beforeEach(() => {
    resetRateLimitForTests();
    vi.mocked(requireUser).mockReset();
    vi.mocked(exportApplicationsCsv).mockReset();
    vi.mocked(importApplications).mockReset();
  });

  it("rejects an unauthenticated export", async () => {
    vi.mocked(requireUser).mockRejectedValue(
      new AppError("UNAUTHORIZED", "You need to sign in to continue."),
    );
    const response = await exportGet(new Request("http://localhost:3000/api/applications/export"));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it("exports only through the signed-in user", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-a", email: "a@example.com" });
    vi.mocked(exportApplicationsCsv).mockResolvedValue("company,role\n");
    const response = await exportGet(new Request("http://localhost:3000/api/applications/export"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(exportApplicationsCsv).toHaveBeenCalledWith("user-a");
  });

  it("rejects an oversized import and rate-limits repeats", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-a", email: "a@example.com" });
    const oversized = new File([new Uint8Array(256 * 1024 + 1)], "roles.csv", {
      type: "text/csv",
    });
    const form = new FormData();
    form.set("file", oversized);
    const response = await importPost(
      new Request("http://localhost:3000/api/applications/import", {
        method: "POST",
        body: form,
      }),
    );
    expect(response.status).toBe(422);
    expect(importApplications).not.toHaveBeenCalled();

    vi.mocked(importApplications).mockResolvedValue({ created: 1, skipped: [] });
    for (let attempt = 0; attempt < 9; attempt += 1) {
      const body = new FormData();
      body.set("file", new File(["company,role\nAcme,Intern\n"], "roles.csv", { type: "text/csv" }));
      const ok = await importPost(
        new Request("http://localhost:3000/api/applications/import", {
          method: "POST",
          body,
        }),
      );
      expect(ok.status).toBe(200);
    }
    const limited = new FormData();
    limited.set("file", new File(["company,role\nAcme,Intern\n"], "roles.csv", { type: "text/csv" }));
    const blocked = await importPost(
      new Request("http://localhost:3000/api/applications/import", {
        method: "POST",
        body: limited,
      }),
    );
    expect(blocked.status).toBe(429);
  });
});
