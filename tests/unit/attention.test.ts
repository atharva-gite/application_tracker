import { describe, expect, it } from "vitest";

import {
  buildAttentionItems,
  describeDeadline,
  describePast,
  describeWhen,
} from "@/lib/attention";

describe("describeWhen", () => {
  it("labels overdue, today, and tomorrow", () => {
    const now = new Date("2026-09-14T12:00:00");
    expect(describeWhen("2026-09-13", now)).toMatchObject({
      overdue: true,
      label: "Yesterday",
    });
    expect(describeWhen("2026-09-14", now)).toMatchObject({
      overdue: false,
      label: "Today",
    });
    expect(describeWhen("2026-09-15", now)).toMatchObject({
      overdue: false,
      label: "Tomorrow",
    });
  });
});

describe("describePast", () => {
  it("does not mark last activity as overdue", () => {
    const now = new Date("2026-09-14T12:00:00");
    expect(describePast("2026-09-14T09:00:00", now)).toBe("Today");
    expect(describePast("2026-09-13T09:00:00", now)).toBe("Yesterday");
    expect(describePast("2026-09-12T09:00:00", now)).toBe("2 days ago");
    expect(describePast("2026-09-01T09:00:00", now)).toBe("Sep 1");
  });
});

describe("describeDeadline", () => {
  it("distinguishes overdue, today, tomorrow, upcoming, and missing deadlines", () => {
    const now = new Date("2026-09-14T12:00:00");
    expect(describeDeadline("2026-09-13", now)).toEqual({
      kind: "overdue",
      label: "Yesterday",
    });
    expect(describeDeadline("2026-09-14", now)).toEqual({
      kind: "due_today",
      label: "Today",
    });
    expect(describeDeadline("2026-09-15", now)).toEqual({
      kind: "due_tomorrow",
      label: "Tomorrow",
    });
    expect(describeDeadline("2026-09-18", now)).toEqual({
      kind: "upcoming",
      label: "In 4 days",
    });
    expect(describeDeadline(null, now)).toEqual({ kind: "none", label: "—" });
  });
});

describe("buildAttentionItems", () => {
  it("puts overdue follow-ups ahead of later interviews", () => {
    const now = new Date("2026-09-14T12:00:00");
    const items = buildAttentionItems(
      {
        interviews: [
          {
            id: "int-1",
            applicationId: "app-1",
            scheduledAt: "2026-09-16T10:00:00",
            company: "Google",
          },
        ],
        deadlines: [],
        followUps: [
          {
            id: "fu-1",
            applicationId: "app-2",
            dueAt: "2026-09-13T09:00:00",
            completedAt: null,
            company: "Meta",
            typeLabel: "Recruiter",
          },
        ],
      },
      now,
    );
    expect(items.map((item) => item.kind)).toEqual(["follow_up", "interview"]);
    expect(items[0]?.relative.overdue).toBe(true);
    expect(items[1]?.href).toBe("/interviews/int-1");
  });
});
