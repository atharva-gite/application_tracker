import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { interviewInputSchema } from "@/lib/validation/interview";
import { parseSchema } from "@/lib/validation/helpers";
import {
  getJobSearchAnalytics,
  getAnalyticsConversion,
  getAnalyticsOverview,
} from "@/server/services/analytics-service";
import { changeApplicationStatus } from "@/server/services/application-service";
import { getDashboard } from "@/server/services/dashboard-service";
import { createInterview } from "@/server/services/interview-service";
import {
  createTestApplication,
  createTestUser,
  ensureDatabase,
} from "@/tests/helpers/db";

const NOW = new Date("2026-09-14T12:00:00.000Z");

async function stampHistory(
  applicationId: string,
  times: Array<{ toStatus: "SAVED" | "APPLIED" | "ASSESSMENT" | "INTERVIEW" | "OFFER" | "REJECTED" | "WITHDRAWN"; at: string }>,
) {
  const rows = await prisma.applicationStatusHistory.findMany({
    where: { applicationId },
    orderBy: { changedAt: "asc" },
  });
  for (const time of times) {
    const row = rows.find((entry) => entry.toStatus === time.toStatus);
    if (row) {
      await prisma.applicationStatusHistory.update({
        where: { id: row.id },
        data: { changedAt: new Date(time.at) },
      });
    }
  }
}

describe("job search analytics", () => {
  it("counts applications, interviews, and offers with shared interview definition", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Analytics Owner");
    const applied = await createTestApplication(user.id, {
      companyName: "LinkedIn Co",
      roleTitle: "Applied Role",
      status: "APPLIED",
      source: "LinkedIn",
      applicationDate: "2026-09-10",
    });
    const interviewApp = await createTestApplication(user.id, {
      companyName: "Interview Co",
      roleTitle: "Interview Role",
      status: "APPLIED",
      source: "LinkedIn",
      applicationDate: "2026-09-10",
    });
    const offerApp = await createTestApplication(user.id, {
      companyName: "Offer Co",
      roleTitle: "Offer Role",
      status: "APPLIED",
      source: "Referral",
      applicationDate: "2026-09-10",
    });
    const laterRejected = await createTestApplication(user.id, {
      companyName: "Past Offer Co",
      roleTitle: "Past Offer",
      status: "OFFER",
      source: "Company site",
      applicationDate: "2026-09-10",
    });

    await createInterview(
      user.id,
      interviewApp.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-20T10:00",
        type: "TECHNICAL",
      }),
    );
    await createInterview(
      user.id,
      interviewApp.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-22T10:00",
        type: "BEHAVIORAL",
      }),
    );
    await changeApplicationStatus(user.id, offerApp.id, { status: "OFFER" });
    await changeApplicationStatus(user.id, laterRejected.id, { status: "REJECTED" });

    const analytics = await getJobSearchAnalytics(user.id, "all", NOW);
    const dashboard = await getDashboard(user.id);

    expect(analytics.applications).toBe(4);
    expect(analytics.interviews).toBe(3);
    expect(analytics.offers).toBe(2);
    expect(analytics.applicationToInterview).toBe(0.75);
    expect(analytics.interviewToOffer).toBe(0.667);
    expect(dashboard.metrics.interviews).toBe(analytics.interviews);
    expect(dashboard.metrics.offers).toBe(1);
    expect(applied.id).toBeTruthy();

    const linkedIn = analytics.bySource.find((row) => row.source === "LinkedIn");
    expect(linkedIn).toMatchObject({ applications: 2, interviews: 1, offers: 0 });
    expect(analytics.byStatus.find((row) => row.status === "APPLIED")?.count).toBe(1);
    expect(analytics.byStatus.find((row) => row.status === "REJECTED")?.count).toBe(1);
  });

  it("filters by application date and isolates users", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Range Owner");
    const other = await createTestUser("Range Other");

    await createTestApplication(user.id, {
      companyName: "Old Co",
      roleTitle: "Old Role",
      status: "APPLIED",
      source: "LinkedIn",
      applicationDate: "2026-01-02",
    });
    await createTestApplication(user.id, {
      companyName: "New Co",
      roleTitle: "New Role",
      status: "APPLIED",
      source: "Referral",
      applicationDate: "2026-09-12",
    });
    await createTestApplication(other.id, {
      companyName: "Other Co",
      roleTitle: "Other Role",
      status: "INTERVIEW",
      source: "LinkedIn",
      applicationDate: "2026-09-12",
    });

    const week = await getJobSearchAnalytics(user.id, "7", NOW);
    const all = await getJobSearchAnalytics(user.id, "all", NOW);
    const otherOverview = await getAnalyticsOverview(other.id, "all", NOW);

    expect(week.applications).toBe(1);
    expect(week.bySource.map((row) => row.source)).toEqual(["Referral"]);
    expect(all.applications).toBe(2);
    expect(otherOverview.applications).toBe(1);
    expect(otherOverview.interviews).toBe(1);
  });

  it("measures completed and current time in stage from status history", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Stage Owner");
    const application = await createTestApplication(user.id, {
      companyName: "Duration Co",
      roleTitle: "Duration Role",
      status: "APPLIED",
      applicationDate: "2026-09-01",
    });
    await stampHistory(application.id, [
      { toStatus: "APPLIED", at: "2026-09-01T00:00:00.000Z" },
    ]);
    await changeApplicationStatus(user.id, application.id, { status: "INTERVIEW" });
    await stampHistory(application.id, [
      { toStatus: "APPLIED", at: "2026-09-01T00:00:00.000Z" },
      { toStatus: "INTERVIEW", at: "2026-09-04T00:00:00.000Z" },
    ]);

    const analytics = await getJobSearchAnalytics(user.id, "all", NOW);
    expect(analytics.timeInStage.find((row) => row.status === "APPLIED")).toMatchObject({
      averageDays: 3,
      completedSamples: 1,
      openSamples: 0,
    });
    expect(analytics.timeInStage.find((row) => row.status === "INTERVIEW")).toMatchObject({
      averageDays: 10.5,
      openSamples: 1,
    });
  });

  it("returns undefined conversion for saved-only and small datasets", async (context) => {
    await ensureDatabase(context);
    const emptyUser = await createTestUser("Empty Analytics");
    const smallUser = await createTestUser("Small Analytics");
    await createTestApplication(emptyUser.id, {
      companyName: "Saved Co",
      roleTitle: "Saved Role",
      status: "SAVED",
    });
    await createTestApplication(smallUser.id, {
      companyName: "One Co",
      roleTitle: "One Role",
      status: "INTERVIEW",
      applicationDate: "2026-09-10",
    });

    const empty = await getAnalyticsConversion(emptyUser.id, "all", NOW);
    const small = await getAnalyticsConversion(smallUser.id, "all", NOW);

    expect(empty.applied).toBe(0);
    expect(empty.applicationToInterview).toBeNull();
    expect(empty.interviewToOffer).toBeNull();
    expect(small.applied).toBe(1);
    expect(small.applicationToInterview).toBe(1);
  });
});
