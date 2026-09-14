import { describe, expect, it } from "vitest";

import {
  averageStageDurationDays,
  conversionRate,
  isAllowedStatusTransition,
  shouldAdvanceToInterview,
  summarizeSources,
} from "@/lib/analytics-math";

describe("conversionRate", () => {
  it("returns zero when nothing has been submitted", () => {
    expect(conversionRate(8, 0)).toBe(0);
  });

  it("rounds application-to-interview conversion", () => {
    expect(conversionRate(8, 47)).toBe(0.17);
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

describe("summarizeSources", () => {
  it("counts which sources produce interviews", () => {
    expect(
      summarizeSources([
        { source: "LinkedIn", status: "APPLIED", hasInterview: false },
        { source: "LinkedIn", status: "INTERVIEW", hasInterview: true },
        { source: "Campus", status: "APPLIED", hasInterview: false },
        { source: null, status: "SAVED", hasInterview: false },
      ]),
    ).toEqual([
      { source: "LinkedIn", count: 2, interviews: 1 },
      { source: "Campus", count: 1, interviews: 0 },
      { source: "Unspecified", count: 1, interviews: 0 },
    ]);
  });
});

describe("averageStageDurationDays", () => {
  it("measures time in Applied before Interview", () => {
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

    expect(result.find((row) => row.status === "APPLIED")?.averageDays).toBe(3);
    expect(result.find((row) => row.status === "INTERVIEW")?.averageDays).toBe(2);
    expect(result.find((row) => row.status === "SAVED")?.averageDays).toBe(0);
  });
});
