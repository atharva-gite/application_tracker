import { describe, expect, it } from "vitest";

import {
  averageStageDurationDays,
  conversionRate,
  isAllowedStatusTransition,
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
