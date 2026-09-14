import { describe, expect, it } from "vitest";

import {
  buildApplicationTimeline,
  describeFollowUpDue,
  describeStatusHistoryEntry,
  documentKindLabel,
  groupTimelineByDay,
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
      "Recruiter follow-up completed",
      "Technical interview scheduled",
      "Moved from Applied → Interview",
      "Recruiter follow-up created",
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
