import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { GET as readyGet } from "@/app/api/ready/route";
import { prisma } from "@/lib/prisma";

describe("GET /api/ready", () => {
  beforeEach(() => {
    vi.mocked(prisma.$queryRaw).mockReset();
  });

  it("returns 200 when the database answers", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }] as never);
    const response = await readyGet(new Request("http://localhost:3000/api/ready"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.database).toBe("ok");
    expect(body.checks.storage).toMatch(/local|s3/);
    expect(body.checks.email).toMatch(/console|resend/);
  });

  it("returns 503 when the database is unreachable", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("connect ECONNREFUSED"));
    const response = await readyGet(new Request("http://localhost:3000/api/ready"));
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.checks.database).toBe("error");
    expect(JSON.stringify(body)).not.toContain("ECONNREFUSED");
  });
});
