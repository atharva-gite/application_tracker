import { describe, expect, it } from "vitest";

import { isStaleApplication } from "@/lib/attention";
import { prisma } from "@/lib/prisma";
import { getDashboard } from "@/server/services/dashboard-service";
import { createTestApplication, createTestUser, ensureDatabase } from "@/tests/helpers/db";

describe("dashboard stalled applications", () => {
  it("returns Applied and Assessment roles whose latest status change is at least 14 days old", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Stale Owner");
    const stale = await createTestApplication(user.id, {
      companyName: "Notion",
      roleTitle: "Product Engineer Intern",
      status: "APPLIED",
    });
    const recent = await createTestApplication(user.id, {
      companyName: "Adobe",
      roleTitle: "Frontend Intern",
      status: "ASSESSMENT",
    });
    const rejected = await createTestApplication(user.id, {
      companyName: "Meta",
      roleTitle: "Rejected Role",
      status: "REJECTED",
    });

    const quiet = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000);
    const fresh = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    await prisma.applicationStatusHistory.updateMany({
      where: { applicationId: stale.id },
      data: { changedAt: quiet },
    });
    await prisma.applicationStatusHistory.updateMany({
      where: { applicationId: recent.id },
      data: { changedAt: fresh },
    });
    await prisma.applicationStatusHistory.updateMany({
      where: { applicationId: rejected.id },
      data: { changedAt: quiet },
    });

    const dashboard = await getDashboard(user.id);
    const stalled = dashboard.staleCandidates.filter((candidate) =>
      isStaleApplication(
        {
          status: candidate.status,
          archivedAt: null,
          lastStatusChangedAt: candidate.lastStatusChangedAt,
        },
        new Date(),
        "UTC",
      ),
    );

    expect(stalled.map((candidate) => candidate.id)).toEqual([stale.id]);
    expect(dashboard.staleCandidates.map((candidate) => candidate.id)).not.toContain(rejected.id);
  });
});