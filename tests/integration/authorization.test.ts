import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { followUpInputSchema } from "@/lib/validation/follow-up";
import { interviewInputSchema } from "@/lib/validation/interview";
import { parseSchema } from "@/lib/validation/helpers";
import {
  archiveApplication,
  changeApplicationStatus,
  getApplication,
  getApplicationHistory,
  listApplications,
} from "@/server/services/application-service";
import { createCompany, deleteCompany, getCompany } from "@/server/services/company-service";
import { createContact, getOwnedContact, listContacts } from "@/server/services/contact-service";
import {
  getDashboard,
  getAnalyticsConversion,
  getAnalyticsOverview,
} from "@/server/services/dashboard-service";
import {
  createFollowUp,
  listApplicationFollowUps,
} from "@/server/services/follow-up-service";
import {
  createInterview,
  listApplicationInterviews,
} from "@/server/services/interview-service";
import { createNote, listApplicationNotes } from "@/server/services/note-service";
import { registerUser } from "@/server/services/auth-service";
import {
  createTestApplication,
  createTestUser,
  ensureDatabase,
  uniqueEmail,
} from "@/tests/helpers/db";

describe("authorization isolation", () => {
  it("prevents user B from reading or mutating user A's data", async (context) => {
    await ensureDatabase(context);

    const owner = await createTestUser("Owner");
    const other = await createTestUser("Other");

    const application = await createTestApplication(owner.id, {
      companyName: "Stripe",
      roleTitle: "Backend Intern",
      source: "LinkedIn",
      location: "Remote",
      deadline: "2026-09-18",
    });

    const interview = await createInterview(
      owner.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-17T10:00",
        type: "TECHNICAL",
      }),
    );
    const note = await createNote(owner.id, application.id, {
      content: "Prepare graph algorithms",
    });
    const followUp = await createFollowUp(
      owner.id,
      application.id,
      parseSchema(followUpInputSchema, {
        dueAt: "2026-09-19T09:00",
        type: "RECRUITER",
      }),
    );
    const contact = await createContact(owner.id, {
      name: "Jane Doe",
      role: "Recruiter",
    });

    await expect(getApplication(other.id, application.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(getCompany(other.id, application.company.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(getOwnedContact(contact.id, other.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(listApplicationInterviews(other.id, application.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(listApplicationNotes(other.id, application.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(listApplicationFollowUps(other.id, application.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      createNote(other.id, application.id, { content: "should not work" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      changeApplicationStatus(other.id, application.id, { status: "REJECTED" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    const ownerList = await listApplications(owner.id, { page: 1, pageSize: 20 });
    const otherList = await listApplications(other.id, { page: 1, pageSize: 20 });
    expect(ownerList.applications.some((item) => item.id === application.id)).toBe(true);
    expect(otherList.applications).toHaveLength(0);

    const otherContacts = await listContacts(other.id, { page: 1, pageSize: 20 });
    expect(otherContacts.contacts).toHaveLength(0);

    const ownerOverview = await getAnalyticsOverview(owner.id);
    const otherOverview = await getAnalyticsOverview(other.id);
    expect(ownerOverview.applications).toBeGreaterThanOrEqual(1);
    expect(otherOverview.applications).toBe(0);

    expect(interview.id).toBeTruthy();
    expect(note.id).toBeTruthy();
    expect(followUp.id).toBeTruthy();
  });
});

describe("application workflow", () => {
  it("creates records for the owner, records history, and filters/sorts", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Filter User");

    const saved = await createTestApplication(user.id, {
      companyName: "Google",
      roleTitle: "Software Engineering Intern",
      status: "SAVED",
      source: "Campus",
      location: "Mountain View",
      deadline: "2026-10-01",
    });
    const applied = await createTestApplication(user.id, {
      companyName: "Meta",
      roleTitle: "ML Intern",
      status: "APPLIED",
      source: "LinkedIn",
      location: "Remote",
      deadline: "2026-09-18",
    });

    const moved = await changeApplicationStatus(user.id, applied.id, {
      status: "INTERVIEW",
    });
    expect(moved.status).toBe("INTERVIEW");

    const history = await getApplicationHistory(user.id, applied.id);
    expect(history.history.map((entry) => entry.toStatus)).toEqual([
      "APPLIED",
      "INTERVIEW",
    ]);

    const interviews = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      status: "INTERVIEW",
    });
    expect(interviews.applications.map((item) => item.id)).toEqual([applied.id]);

    const google = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      q: "google",
    });
    expect(google.applications.map((item) => item.id)).toEqual([saved.id]);

    const byDeadline = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      sort: "deadline",
      order: "asc",
    });
    expect(byDeadline.applications.map((item) => item.company.name)).toEqual([
      "Meta",
      "Google",
    ]);

    await archiveApplication(user.id, saved.id);
    const active = await listApplications(user.id, { page: 1, pageSize: 20 });
    expect(active.applications.map((item) => item.id)).toEqual([applied.id]);
  });

  it("rejects a duplicate company name and deleting a company in use", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Company User");
    const company = await createCompany(user.id, { name: "Notion" });
    await createTestApplication(user.id, {
      companyId: company.id,
      roleTitle: "Intern",
    });

    await expect(createCompany(user.id, { name: "notion" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
    await expect(deleteCompany(user.id, company.id)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("surfaces interviews, deadlines, and follow-ups on the dashboard", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Dashboard User");
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);

    const application = await createTestApplication(user.id, {
      companyName: "Google",
      roleTitle: "SWE Intern",
      status: "APPLIED",
      deadline: new Date().toISOString().slice(0, 10),
    });
    await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: tomorrow,
        type: "TECHNICAL",
        interviewerName: "Jane Doe",
      }),
    );
    await createFollowUp(
      user.id,
      application.id,
      parseSchema(followUpInputSchema, {
        dueAt: tomorrow,
        type: "RECRUITER",
      }),
    );

    const dashboard = await getDashboard(user.id);
    expect(dashboard.metrics.applications).toBe(1);
    expect(dashboard.metrics.active).toBe(1);
    expect(dashboard.metrics.interviews).toBe(1);
    expect(dashboard.upcomingInterviews).toHaveLength(1);
    expect(dashboard.upcomingDeadlines).toHaveLength(1);
    expect(dashboard.followUps).toHaveLength(1);

    const conversion = await getAnalyticsConversion(user.id);
    expect(conversion.applied).toBe(1);
    expect(conversion.interview).toBe(1);
    expect(conversion.applicationToInterview).toBe(1);
  });
});

describe("auth uniqueness", () => {
  it("rejects a second account with the same email", async (context) => {
    await ensureDatabase(context);
    const email = uniqueEmail("dup");
    await registerUser({
      name: "First",
      email,
      password: "password12",
    });
    await expect(
      registerUser({
        name: "Second",
        email,
        password: "password12",
      }),
    ).rejects.toBeInstanceOf(AppError);

    try {
      await registerUser({
        name: "Second",
        email,
        password: "password12",
      });
    } catch (error) {
      expect((error as AppError).code).toBe("CONFLICT");
    }
  });
});

describe("document ownership", () => {
  it("stores metadata for the owner and hides files from other users", async (context) => {
    await ensureDatabase(context);
    const owner = await createTestUser("Doc Owner");
    const other = await createTestUser("Doc Other");
    const { uploadDocument, getDocumentFile, listDocuments } = await import(
      "@/server/services/document-service"
    );

    const document = await uploadDocument(
      owner.id,
      { name: "Resume - Backend", type: "RESUME" },
      {
        name: "resume.pdf",
        type: "application/pdf",
        size: 8,
        bytes: Buffer.from("%PDF-1.1"),
      },
    );
    expect(document.filename).toBe("resume.pdf");
    expect(document).not.toHaveProperty("storageKey");

    const listed = await listDocuments(other.id, { page: 1, pageSize: 20 });
    expect(listed.documents).toHaveLength(0);

    await expect(getDocumentFile(other.id, document.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });

    const file = await getDocumentFile(owner.id, document.id);
    expect(file.bytes.toString()).toContain("%PDF");
  });
});

describe("database connectivity", () => {
  it("uses postgresql in integration tests when available", async (context) => {
    await ensureDatabase(context);
    const result = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 as one`;
    expect(result[0]?.one).toBe(1);
  });
});
