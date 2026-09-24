import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { PRODUCT_EVENTS } from "@/lib/product-events";
import { interviewInputSchema } from "@/lib/validation/interview";
import { parseSchema } from "@/lib/validation/helpers";
import { getApplication } from "@/server/services/application-service";
import { getDashboard } from "@/server/services/dashboard-service";
import {
  createInterview,
  getInterview,
  listUserInterviews,
  updateInterview,
} from "@/server/services/interview-service";
import { createNote } from "@/server/services/note-service";
import {
  createTestApplication,
  createTestUser,
  ensureDatabase,
} from "@/tests/helpers/db";
import { groupInterviews } from "@/lib/interviews";
import { buildAttentionItems } from "@/lib/attention";

describe("interview workflow", () => {
  it("loads interview details, meeting URL, and related application data", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Interview Owner");
    const application = await createTestApplication(user.id, {
      companyName: "Google",
      roleTitle: "Software Engineering Intern",
      status: "APPLIED",
    });
    const interview = await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-17T10:00",
        type: "TECHNICAL",
        interviewerName: "Jane Doe",
        meetingUrl: "https://meet.example.com/abc",
        notes: "Prepare graph algorithms",
      }),
    );

    const loaded = await getInterview(user.id, interview.id);
    expect(loaded.applicationId).toBe(application.id);
    expect(loaded.application?.company.name).toBe("Google");
    expect(loaded.application?.roleTitle).toBe("Software Engineering Intern");
    expect(loaded.meetingUrl).toBe("https://meet.example.com/abc");
    expect(loaded.interviewerName).toBe("Jane Doe");
    expect(loaded.notes).toBe("Prepare graph algorithms");
    expect(loaded.status).toBe("SCHEDULED");
    expect(loaded.outcome).toBeNull();
    expect(
      await prisma.productEvent.count({
        where: { userId: user.id, name: PRODUCT_EVENTS.interviewCreated, entityId: interview.id },
      }),
    ).toBe(1);
  });

  it("groups upcoming and past interviews for the owner", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Interview List");
    const application = await createTestApplication(user.id, {
      companyName: "Meta",
      roleTitle: "ML Intern",
    });
    const now = new Date("2026-09-14T12:00:00");
    const upcoming = await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-20T10:00",
        type: "BEHAVIORAL",
      }),
    );
    const past = await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-10T10:00",
        type: "PHONE_SCREEN",
      }),
    );
    await updateInterview(user.id, past.id, { status: "COMPLETED" });

    const listed = await listUserInterviews(user.id);
    const grouped = groupInterviews(listed.interviews, now);
    expect(grouped.upcoming.map((item) => item.id)).toContain(upcoming.id);
    expect(grouped.past.map((item) => item.id)).toContain(past.id);
    expect(grouped.upcoming.map((item) => item.id)).not.toContain(past.id);
  });

  it("returns an empty list when the user has no interviews", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Interview Empty");
    const listed = await listUserInterviews(user.id);
    expect(listed.interviews).toEqual([]);
  });

  it("prevents another user from reading or updating an interview", async (context) => {
    await ensureDatabase(context);
    const owner = await createTestUser("Interview Auth Owner");
    const other = await createTestUser("Interview Auth Other");
    const application = await createTestApplication(owner.id, {
      companyName: "Stripe",
      roleTitle: "Backend Intern",
    });
    const interview = await createInterview(
      owner.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-17T10:00",
        type: "TECHNICAL",
      }),
    );

    await expect(getInterview(other.id, interview.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      updateInterview(other.id, interview.id, { notes: "should not work" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(getInterview(other.id, "missing-interview")).rejects.toBeInstanceOf(AppError);
  });

  it("does not modify an unrelated application when an interview is updated", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Interview Isolation");
    const target = await createTestApplication(user.id, {
      companyName: "Notion",
      roleTitle: "Product Intern",
      status: "APPLIED",
    });
    const other = await createTestApplication(user.id, {
      companyName: "Figma",
      roleTitle: "Design Intern",
      status: "SAVED",
      location: "Remote",
    });
    const interview = await createInterview(
      user.id,
      target.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-21T11:00",
        type: "SYSTEM_DESIGN",
      }),
    );
    const before = await getApplication(user.id, other.id);

    await updateInterview(user.id, interview.id, {
      interviewerName: "Alex",
      notes: "Review system design notes",
    });

    const after = await getApplication(user.id, other.id);
    expect(after.status).toBe(before.status);
    expect(after.roleTitle).toBe("Design Intern");
    expect(after.location).toBe(before.location);
    expect(after.updatedAt).toBe(before.updatedAt);

    const targetAfter = await getApplication(user.id, target.id);
    expect(targetAfter.status).toBe("INTERVIEW");
    const kept = await getInterview(user.id, interview.id);
    expect(kept.applicationId).toBe(target.id);
    expect(kept.interviewerName).toBe("Alex");
  });

  it("completes an interview without forcing an outcome during scheduling", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Interview Complete");
    const application = await createTestApplication(user.id, {
      companyName: "Airbnb",
      roleTitle: "Intern",
      status: "APPLIED",
    });
    const interview = await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-16T10:00",
        type: "TECHNICAL",
      }),
    );
    expect(interview.outcome).toBeNull();
    expect(interview.status).toBe("SCHEDULED");

    const completed = await updateInterview(user.id, interview.id, { status: "COMPLETED" });
    expect(completed.status).toBe("COMPLETED");
    expect(completed.outcome).toBe("PENDING");
    expect(completed.applicationId).toBe(application.id);

    const applicationAfter = await getApplication(user.id, application.id);
    expect(applicationAfter.status).toBe("INTERVIEW");

    const withOutcome = await updateInterview(user.id, interview.id, { outcome: "ADVANCED" });
    expect(withOutcome.outcome).toBe("ADVANCED");
  });

  it("links dashboard attention items to the interview", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Interview Dashboard");
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const application = await createTestApplication(user.id, {
      companyName: "Google",
      roleTitle: "SWE Intern",
    });
    const interview = await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: tomorrow,
        type: "TECHNICAL",
        meetingUrl: "https://meet.example.com/dash",
      }),
    );

    const dashboard = await getDashboard(user.id);
    expect(dashboard.upcomingInterviews.map((item) => item.id)).toContain(interview.id);
    const attention = buildAttentionItems({
      interviews: dashboard.upcomingInterviews.map((item) => ({
        id: item.id,
        applicationId: item.applicationId,
        scheduledAt: item.scheduledAt,
        company: item.application?.company.name ?? "Interview",
      })),
      deadlines: [],
      followUps: [],
    });
    const item = attention.find((entry) => entry.id === `interview-${interview.id}`);
    expect(item?.href).toBe(`/interviews/${interview.id}`);
  });

  it("keeps interview notes on the interview and application notes separate", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Interview Notes");
    const application = await createTestApplication(user.id, {
      companyName: "Linear",
      roleTitle: "Intern",
    });
    const interview = await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-22T10:00",
        type: "BEHAVIORAL",
        notes: "Prepare STAR stories",
      }),
    );
    await createNote(user.id, application.id, { content: "Recruiter mentioned the intern program" });

    const loaded = await getInterview(user.id, interview.id);
    expect(loaded.notes).toBe("Prepare STAR stories");
    const applicationNotes = await prisma.note.findMany({
      where: { applicationId: application.id },
    });
    expect(applicationNotes.map((note) => note.content)).toEqual([
      "Recruiter mentioned the intern program",
    ]);
  });
});
