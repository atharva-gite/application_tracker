import { describe, expect, it } from "vitest";

import { buildAttentionItems, describeWhen } from "@/lib/attention";

const now = new Date("2026-09-14T15:00:00");

describe("describeWhen", () => {
  it("labels date-only deadlines relative to today", () => {
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
    expect(describeWhen("2026-09-17", now)).toMatchObject({
      overdue: false,
      label: "In 3 days",
    });
  });

  it("includes the time for datetimes on today and tomorrow", () => {
    expect(describeWhen("2026-09-14T18:30:00", now).label).toMatch(/^Today · /);
    expect(describeWhen("2026-09-15T09:00:00", now).label).toMatch(/^Tomorrow · /);
    expect(describeWhen("2026-09-14T10:00:00", now).overdue).toBe(true);
  });
});

describe("buildAttentionItems", () => {
  it("sorts overdue items first, then soonest upcoming", () => {
    const items = buildAttentionItems(
      {
        interviews: [
          {
            id: "i1",
            applicationId: "a1",
            scheduledAt: "2026-09-16T10:00:00",
            company: "Google",
          },
        ],
        deadlines: [
          {
            id: "a2",
            roleTitle: "Intern",
            company: "Meta",
            deadline: "2026-09-13",
          },
        ],
        followUps: [
          {
            id: "f1",
            applicationId: "a1",
            dueAt: "2026-09-15T12:00:00",
            completedAt: null,
            company: "Google",
            typeLabel: "Recruiter",
          },
        ],
      },
      now,
    );

    expect(items.map((item) => item.title)).toEqual([
      "Meta · Intern",
      "Google recruiter follow-up",
      "Google interview",
    ]);
    expect(items[0]?.relative.overdue).toBe(true);
  });
});
