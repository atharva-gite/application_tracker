import { describe, expect, it } from "vitest";

import {
  groupInterviews,
  interviewGroupKey,
  interviewHref,
  isActiveInterview,
} from "@/lib/interviews";

const now = new Date("2026-09-14T12:00:00");

describe("interview grouping", () => {
  it("puts upcoming interviews into today, tomorrow, and upcoming", () => {
    const grouped = groupInterviews(
      [
        { id: "later", scheduledAt: "2026-09-20T10:00:00", status: "SCHEDULED" },
        { id: "today", scheduledAt: "2026-09-14T16:00:00", status: "SCHEDULED" },
        { id: "tomorrow", scheduledAt: "2026-09-15T09:00:00", status: "SCHEDULED" },
      ],
      now,
    );

    expect(grouped.today.map((item) => item.id)).toEqual(["today"]);
    expect(grouped.tomorrow.map((item) => item.id)).toEqual(["tomorrow"]);
    expect(grouped.upcoming.map((item) => item.id)).toEqual(["later"]);
    expect(grouped.past).toEqual([]);
  });

  it("separates past interviews from upcoming ones", () => {
    expect(interviewGroupKey({ scheduledAt: "2026-09-13T10:00:00", status: "SCHEDULED" }, now)).toBe(
      "past",
    );
    expect(interviewGroupKey({ scheduledAt: "2026-09-20T10:00:00", status: "COMPLETED" }, now)).toBe(
      "past",
    );
    expect(interviewGroupKey({ scheduledAt: "2026-09-20T10:00:00", status: "CANCELLED" }, now)).toBe(
      "past",
    );

    const grouped = groupInterviews(
      [
        { id: "done", scheduledAt: "2026-09-20T10:00:00", status: "COMPLETED" },
        { id: "yesterday", scheduledAt: "2026-09-13T10:00:00", status: "SCHEDULED" },
        { id: "next", scheduledAt: "2026-09-18T10:00:00", status: "SCHEDULED" },
      ],
      now,
    );

    expect(grouped.past.map((item) => item.id)).toEqual(["done", "yesterday"]);
    expect(grouped.upcoming.map((item) => item.id)).toEqual(["next"]);
    expect(isActiveInterview({ scheduledAt: "2026-09-18T10:00:00", status: "SCHEDULED" }, now)).toBe(
      true,
    );
    expect(isActiveInterview({ scheduledAt: "2026-09-13T10:00:00", status: "SCHEDULED" }, now)).toBe(
      false,
    );
  });

  it("keeps a same-day interview in today even after the start time", () => {
    expect(interviewGroupKey({ scheduledAt: "2026-09-14T09:00:00", status: "SCHEDULED" }, now)).toBe(
      "today",
    );
  });
});

describe("interviewHref", () => {
  it("points at the interview detail route", () => {
    expect(interviewHref("int-1")).toBe("/interviews/int-1");
  });
});
