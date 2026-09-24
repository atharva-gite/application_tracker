import { describe, expect, it } from "vitest";

import {
  buildApplicationTimeline,
  describeFollowUpDue,
  describeStatusHistoryEntry,
  documentKindLabel,
  documentUsageLabel,
  groupFollowUpsByDue,
  groupTimelineByDay,
  isDashboardFollowUp,
  visibleJobFields,
} from "@/lib/application-detail";

describe("visibleJobFields", () => {
  it("omits missing optional fields instead of showing empty placeholders", () => {
    expect(
      visibleJobFields({
        applicationDate: "2026-09-10",
        deadline: null,
        location: null,
        employmentType: null,
        source: undefined,
        jobUrl: null,
        salaryMin: null,
        salaryMax: null,
      }),
    ).toEqual([{ label: "Application date", value: expect.any(String) }]);
  });

  it("includes salary only when a range exists", () => {
    const fields = visibleJobFields({
      salaryMin: 40,
      salaryMax: 50,
      salaryCurrency: "USD",
    });
    expect(fields).toEqual([{ label: "Salary", value: "40–50 USD" }]);
  });
});

describe("application timeline", () => {
  it("builds events from persisted status, interview, and follow-up records", () => {
    const events = buildApplicationTimeline({
      history: [
        {
          id: "h1",
          fromStatus: null,
          toStatus: "SAVED",
          changedAt: "2026-09-08T12:00:00.000Z",
        },
        {
          id: "h2",
          fromStatus: "SAVED",
          toStatus: "APPLIED",
          changedAt: "2026-09-10T12:00:00.000Z",
        },
        {
          id: "h3",
          fromStatus: "APPLIED",
          toStatus: "INTERVIEW",
          changedAt: "2026-09-12T15:00:00.000Z",
        },
      ],
      interviews: [
        {
          id: "i1",
          type: "TECHNICAL",
          createdAt: "2026-09-12T16:00:00.000Z",
          scheduledAt: "2026-09-17T10:00:00.000Z",
        },
      ],
      followUps: [
        {
          id: "f1",
          type: "RECRUITER",
          createdAt: "2026-09-11T09:00:00.000Z",
          completedAt: "2026-09-13T09:00:00.000Z",
        },
      ],
    });

    expect(events.map((event) => event.title)).toEqual([
      "Follow up with recruiter completed",
      "Technical interview scheduled",
      "Moved from Applied → Interview",
      "Follow up with recruiter created",
      "Moved from Saved → Applied",
      "Application saved",
    ]);
    expect(groupTimelineByDay(events).map((group) => group.dateLabel).length).toBeGreaterThan(0);
  });

  it("ignores records without timestamps instead of inventing events", () => {
    expect(
      buildApplicationTimeline({
        history: [{ id: "h1", fromStatus: null, toStatus: "SAVED", changedAt: null }],
        interviews: [{ id: "i1", type: "TECHNICAL", createdAt: null, scheduledAt: null }],
        followUps: [{ id: "f1", type: "RECRUITER", createdAt: null, completedAt: null }],
      }),
    ).toEqual([]);
  });
});

describe("describeStatusHistoryEntry", () => {
  it("uses submitted copy for an initial applied stage", () => {
    expect(describeStatusHistoryEntry({ fromStatus: null, toStatus: "APPLIED" })).toBe(
      "Application submitted",
    );
  });
});

describe("describeFollowUpDue", () => {
  const now = new Date("2026-09-14T12:00:00");

  it("distinguishes overdue, due today, upcoming, and completed", () => {
    expect(describeFollowUpDue("2026-09-13T09:00:00", null, now).kind).toBe("overdue");
    expect(describeFollowUpDue("2026-09-14T18:00:00", null, now).kind).toBe("due_today");
    expect(describeFollowUpDue("2026-09-16T09:00:00", null, now).kind).toBe("upcoming");
    expect(describeFollowUpDue("2026-09-13T09:00:00", "2026-09-14T08:00:00", now)).toEqual({
      kind: "completed",
      label: "Completed",
      relative: null,
    });
  });

  it("classifies due times using the user timezone", () => {
    const dueAt = "2026-09-14T23:00:00.000Z";
    const now = new Date("2026-09-14T10:00:00.000Z");
    expect(describeFollowUpDue(dueAt, null, now, "UTC").kind).toBe("due_today");
    expect(describeFollowUpDue(dueAt, null, now, "Asia/Tokyo").kind).toBe("upcoming");
  });
});

describe("groupFollowUpsByDue", () => {
  it("groups overdue, today, upcoming, and completed follow-ups", () => {
    const now = new Date("2026-09-14T12:00:00");
    const groups = groupFollowUpsByDue(
      [
        { id: "1", dueAt: "2026-09-13T09:00:00", completedAt: null },
        { id: "2", dueAt: "2026-09-14T18:00:00", completedAt: null },
        { id: "3", dueAt: "2026-09-16T09:00:00", completedAt: null },
        { id: "4", dueAt: "2026-09-10T09:00:00", completedAt: "2026-09-11T09:00:00" },
      ],
      now,
    );
    expect(groups.map((group) => [group.kind, group.items.map((item) => item.id)])).toEqual([
      ["overdue", ["1"]],
      ["due_today", ["2"]],
      ["upcoming", ["3"]],
      ["completed", ["4"]],
    ]);
  });
});

describe("isDashboardFollowUp", () => {
  it("includes overdue and today, and excludes upcoming and completed", () => {
    const now = new Date("2026-09-14T12:00:00");
    expect(isDashboardFollowUp("2026-09-13T09:00:00", null, now)).toBe(true);
    expect(isDashboardFollowUp("2026-09-14T18:00:00", null, now)).toBe(true);
    expect(isDashboardFollowUp("2026-09-16T09:00:00", null, now)).toBe(false);
    expect(isDashboardFollowUp("2026-09-13T09:00:00", "2026-09-14T08:00:00", now)).toBe(false);
  });
});

describe("documentKindLabel", () => {
  it("labels resumes used for an application", () => {
    expect(
      documentKindLabel({
        type: "RESUME",
        mimeType: "application/pdf",
        filename: "resume.pdf",
      }),
    ).toEqual({ type: "Resume", format: "PDF" });
  });
});

describe("documentUsageLabel", () => {
  it("uses actual application counts", () => {
    expect(documentUsageLabel(0)).toBe("Used in 0 applications");
    expect(documentUsageLabel(1)).toBe("Used in 1 application");
    expect(documentUsageLabel(8)).toBe("Used in 8 applications");
  });
});
