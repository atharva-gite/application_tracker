import { describe, expect, it } from "vitest";

import {
  applicationReachedInterview,
  applicationReachedOffer,
  averageStageDurationDays,
  buildJobSearchAnalytics,
  conversionRate,
  isAllowedStatusTransition,
  rateLabel,
  shouldAdvanceToInterview,
  summarizeSources,
} from "@/lib/analytics-math";
import {
  analyticsPeriodStart,
  isApplicationInPeriod,
} from "@/lib/analytics-period";

describe("conversionRate", () => {
  it("is undefined when the denominator is zero", () => {
    expect(conversionRate(8, 0)).toBeNull();
    expect(conversionRate(0, 0)).toBeNull();
  });

  it("rounds application-to-interview conversion", () => {
    expect(conversionRate(8, 47)).toBe(0.17);
  });

  it("does not invent 0% when the rate cannot be calculated", () => {
    expect(rateLabel(null, 0)).toBe("Not enough data yet");
    expect(rateLabel(1, 1)).toBe("Not enough data yet");
    expect(rateLabel(0.167, 30)).toBe("16.7%");
  });
});

describe("status transitions", () => {
  it("allows Applied to Interview", () => {
    expect(isAllowedStatusTransition("APPLIED", "INTERVIEW")).toBe(true);
  });

  it("allows moving to a terminal stage", () => {
    expect(isAllowedStatusTransition("INTERVIEW", "REJECTED")).toBe(true);
    expect(isAllowedStatusTransition("OFFER", "WITHDRAWN")).toBe(true);
  });

  it("advances early pipeline stages when an interview is added", () => {
    expect(shouldAdvanceToInterview("SAVED")).toBe(true);
    expect(shouldAdvanceToInterview("APPLIED")).toBe(true);
    expect(shouldAdvanceToInterview("ASSESSMENT")).toBe(true);
    expect(shouldAdvanceToInterview("OFFER")).toBe(false);
    expect(shouldAdvanceToInterview("REJECTED")).toBe(false);
  });
});

describe("reached interview and offer", () => {
  it("counts a role that left Interview even without interview records", () => {
    expect(
      applicationReachedInterview({
        status: "REJECTED",
        hasInterview: false,
        historyStatuses: ["APPLIED", "INTERVIEW", "REJECTED"],
      }),
    ).toBe(true);
  });

  it("counts one application once when it has several interview records", () => {
    expect(
      applicationReachedInterview({
        status: "INTERVIEW",
        hasInterview: true,
      }),
    ).toBe(true);
  });

  it("counts offers that later moved to Rejected", () => {
    expect(
      applicationReachedOffer({
        status: "REJECTED",
        historyStatuses: ["INTERVIEW", "OFFER", "REJECTED"],
      }),
    ).toBe(true);
  });
});

describe("summarizeSources", () => {
  it("counts applications that reached interview per source", () => {
    expect(
      summarizeSources([
        { source: "LinkedIn", status: "APPLIED", hasInterview: false },
        { source: "LinkedIn", status: "INTERVIEW", hasInterview: true },
        { source: "Campus", status: "APPLIED", hasInterview: false },
        { source: null, status: "SAVED", hasInterview: false },
      ]),
    ).toEqual([
      {
        source: "LinkedIn",
        applications: 2,
        interviews: 1,
        offers: 0,
        interviewRate: 0.5,
      },
      {
        source: "Campus",
        applications: 1,
        interviews: 0,
        offers: 0,
        interviewRate: 0,
      },
      {
        source: "Unspecified",
        applications: 1,
        interviews: 0,
        offers: 0,
        interviewRate: 0,
      },
    ]);
  });
});

describe("averageStageDurationDays", () => {
  it("measures completed Applied time and current Interview elapsed time", () => {
    const start = new Date("2026-09-01T00:00:00.000Z");
    const interview = new Date("2026-09-04T00:00:00.000Z");
    const now = new Date("2026-09-06T00:00:00.000Z");

    const result = averageStageDurationDays(
      [
        {
          applicationId: "app-1",
          toStatus: "APPLIED",
          changedAt: start,
        },
        {
          applicationId: "app-1",
          toStatus: "INTERVIEW",
          changedAt: interview,
        },
      ],
      now,
    );

    expect(result.find((row) => row.status === "APPLIED")).toMatchObject({
      averageDays: 3,
      completedSamples: 1,
      openSamples: 0,
    });
    expect(result.find((row) => row.status === "INTERVIEW")).toMatchObject({
      averageDays: 2,
      completedSamples: 0,
      openSamples: 1,
    });
    expect(result.find((row) => row.status === "SAVED")?.averageDays).toBeNull();
  });

  it("does not keep Rejected running until now", () => {
    const result = averageStageDurationDays(
      [
        {
          applicationId: "app-1",
          toStatus: "APPLIED",
          changedAt: new Date("2026-09-01T00:00:00.000Z"),
        },
        {
          applicationId: "app-1",
          toStatus: "REJECTED",
          changedAt: new Date("2026-09-03T00:00:00.000Z"),
        },
      ],
      new Date("2026-09-10T00:00:00.000Z"),
    );

    expect(result.find((row) => row.status === "APPLIED")?.averageDays).toBe(2);
    expect(result.find((row) => row.status === "REJECTED")?.averageDays).toBeNull();
  });
});

describe("buildJobSearchAnalytics", () => {
  const now = new Date("2026-09-14T12:00:00.000Z");

  it("counts applications, interviews, and offers without double-counting interviews", () => {
    const analytics = buildJobSearchAnalytics(
      [
        {
          id: "a1",
          status: "APPLIED",
          source: "LinkedIn",
          hasInterview: false,
          history: [{ toStatus: "APPLIED", changedAt: now }],
        },
        {
          id: "a2",
          status: "INTERVIEW",
          source: "LinkedIn",
          hasInterview: true,
          history: [
            { toStatus: "APPLIED", changedAt: now },
            { toStatus: "INTERVIEW", changedAt: now },
          ],
        },
        {
          id: "a3",
          status: "OFFER",
          source: "Referral",
          hasInterview: true,
          history: [
            { toStatus: "INTERVIEW", changedAt: now },
            { toStatus: "OFFER", changedAt: now },
          ],
        },
      ],
      "all",
      now,
    );

    expect(analytics.applications).toBe(3);
    expect(analytics.submitted).toBe(3);
    expect(analytics.interviews).toBe(2);
    expect(analytics.offers).toBe(1);
    expect(analytics.applicationToInterview).toBe(0.667);
    expect(analytics.interviewToOffer).toBe(0.5);
    expect(analytics.byStatus.find((row) => row.status === "APPLIED")?.count).toBe(1);
  });

  it("uses interview-stage history when there is no interview record", () => {
    const analytics = buildJobSearchAnalytics(
      [
        {
          id: "rejected-after-interview",
          status: "REJECTED",
          source: "Company site",
          hasInterview: false,
          history: [
            { toStatus: "APPLIED", changedAt: now },
            { toStatus: "INTERVIEW", changedAt: now },
            { toStatus: "REJECTED", changedAt: now },
          ],
        },
      ],
      "all",
      now,
    );

    expect(analytics.interviews).toBe(1);
    expect(analytics.offers).toBe(0);
  });

  it("hides misleading rates on a single application", () => {
    const analytics = buildJobSearchAnalytics(
      [
        {
          id: "only",
          status: "INTERVIEW",
          source: "LinkedIn",
          hasInterview: true,
          history: [{ toStatus: "INTERVIEW", changedAt: now }],
        },
      ],
      "all",
      now,
    );

    expect(analytics.applicationToInterview).toBe(1);
    expect(rateLabel(analytics.applicationToInterview, analytics.submitted)).toBe(
      "Not enough data yet",
    );
  });

  it("leaves conversion undefined when nothing has been submitted", () => {
    const analytics = buildJobSearchAnalytics(
      [
        {
          id: "saved",
          status: "SAVED",
          source: null,
          hasInterview: false,
          history: [{ toStatus: "SAVED", changedAt: now }],
        },
      ],
      "all",
      now,
    );

    expect(analytics.applications).toBe(1);
    expect(analytics.submitted).toBe(0);
    expect(analytics.applicationToInterview).toBeNull();
    expect(analytics.interviewToOffer).toBeNull();
  });
});

describe("analytics period", () => {
  const now = new Date("2026-09-14T15:00:00.000Z");

  it("starts seven UTC days inclusive of today", () => {
    expect(analyticsPeriodStart("7", now)?.toISOString()).toBe(
      "2026-09-08T00:00:00.000Z",
    );
    expect(analyticsPeriodStart("all", now)).toBeNull();
  });

  it("uses application date, falling back to created at", () => {
    expect(
      isApplicationInPeriod({
        applicationDate: new Date("2026-08-01T00:00:00.000Z"),
        createdAt: now,
        range: "30",
        now,
      }),
    ).toBe(false);
    expect(
      isApplicationInPeriod({
        applicationDate: null,
        createdAt: now,
        range: "7",
        now,
      }),
    ).toBe(true);
  });
});
