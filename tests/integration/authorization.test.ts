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
  updateApplication,
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

    const own = await getApplication(owner.id, application.id);
    expect(own.roleTitle).toBe("Backend Intern");
    expect(own.location).toBe("Remote");

    await expect(getApplication(other.id, application.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(getApplication(other.id, "missing-application")).rejects.toMatchObject({
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

  it("loads application workspace records and keeps them after an edit", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Workspace Owner");
    const application = await createTestApplication(user.id, {
      companyName: "Notion",
      roleTitle: "Product Intern",
      status: "SAVED",
    });
    const interview = await createInterview(
      user.id,
      application.id,
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-20T10:00",
        type: "BEHAVIORAL",
        interviewerName: "Alex",
      }),
    );
    const note = await createNote(user.id, application.id, {
      content: "Ask about the intern program",
    });
    const followUp = await createFollowUp(
      user.id,
      application.id,
      parseSchema(followUpInputSchema, {
        dueAt: "2026-09-21T09:00",
        type: "THANK_YOU",
        note: "Send thank-you note",
      }),
    );
    const contact = await createContact(user.id, {
      name: "Sam Recruiter",
      role: "University recruiter",
      email: "sam@example.com",
    });
    const { linkApplicationContact } = await import("@/server/services/contact-service");
    await linkApplicationContact(user.id, application.id, { contactId: contact.id });

    const interviews = await listApplicationInterviews(user.id, application.id);
    const notes = await listApplicationNotes(user.id, application.id);
    const history = await getApplicationHistory(user.id, application.id);
    expect(interviews.interviews.map((item) => item.id)).toEqual([interview.id]);
    expect(notes.notes.map((item) => item.content)).toEqual(["Ask about the intern program"]);
    expect(history.history[0]?.toStatus).toBe("SAVED");
    expect(history.history[0]?.fromStatus).toBeNull();

    await updateApplication(user.id, application.id, {
      roleTitle: "Software Intern",
      location: "Remote",
    });

    const updated = await getApplication(user.id, application.id);
    expect(updated.roleTitle).toBe("Software Intern");
    const keptInterviews = await listApplicationInterviews(user.id, application.id);
    const keptNotes = await listApplicationNotes(user.id, application.id);
    const keptFollowUps = await listApplicationFollowUps(user.id, application.id);
    expect(keptInterviews.interviews.map((item) => item.id)).toEqual([interview.id]);
    expect(keptNotes.notes.map((item) => item.id)).toEqual([note.id]);
    expect(keptFollowUps.followUps.map((item) => item.id)).toEqual([followUp.id]);
    await expect(
      prisma.applicationContact.count({ where: { applicationId: application.id } }),
    ).resolves.toBe(1);
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
    expect(history.history[0]?.fromStatus).toBeNull();
    expect(history.history[1]?.fromStatus).toBe("APPLIED");

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

    const combined = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      q: "intern",
      status: "SAVED",
      source: "Campus",
    });
    expect(combined.applications.map((item) => item.id)).toEqual([saved.id]);

    const byCompany = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      sort: "company",
      order: "asc",
    });
    expect(byCompany.applications.map((item) => item.company.name)).toEqual([
      "Google",
      "Meta",
    ]);

    const byRole = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      sort: "roleTitle",
      order: "asc",
    });
    expect(byRole.applications.map((item) => item.roleTitle)).toEqual([
      "ML Intern",
      "Software Engineering Intern",
    ]);

    const pageOne = await listApplications(user.id, {
      page: 1,
      pageSize: 1,
      sort: "company",
      order: "asc",
    });
    const pageTwo = await listApplications(user.id, {
      page: 2,
      pageSize: 1,
      sort: "company",
      order: "asc",
    });
    expect(pageOne.total).toBe(2);
    expect(pageOne.applications.map((item) => item.company.name)).toEqual(["Google"]);
    expect(pageTwo.applications.map((item) => item.company.name)).toEqual(["Meta"]);

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

  it("derives last activity from persisted notes and history, and filters deadlines", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Activity User");
    const stale = await createTestApplication(user.id, {
      companyName: "Zebra",
      roleTitle: "Research Intern",
      status: "SAVED",
      deadline: "2026-12-01",
    });
    const overdue = await createTestApplication(user.id, {
      companyName: "Acme",
      roleTitle: "Backend Intern",
      status: "APPLIED",
      deadline: "2020-01-01",
    });

    await createNote(user.id, stale.id, { content: "Emailed the recruiter" });
    await changeApplicationStatus(user.id, overdue.id, { status: "INTERVIEW" });

    const listed = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      sort: "lastActivity",
      order: "desc",
    });
    expect(listed.applications.map((item) => item.id)).toEqual([overdue.id, stale.id]);
    const staleRow = listed.applications.find((item) => item.id === stale.id);
    const overdueRow = listed.applications.find((item) => item.id === overdue.id);
    expect(staleRow?.lastActivityAt).toBeTruthy();
    expect(staleRow?.createdAt).toBeTruthy();
    expect(new Date(staleRow!.lastActivityAt!).getTime()).toBeGreaterThan(
      new Date(staleRow!.createdAt!).getTime(),
    );
    expect(new Date(overdueRow!.lastActivityAt!).getTime()).toBeGreaterThan(
      new Date(overdueRow!.createdAt!).getTime(),
    );

    const dueOverdue = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      due: "overdue",
    });
    expect(dueOverdue.applications.map((item) => item.id)).toEqual([overdue.id]);

    const dueUpcoming = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      due: "upcoming",
    });
    expect(dueUpcoming.applications.map((item) => item.id)).toEqual([stale.id]);

    const roleSearch = await listApplications(user.id, {
      page: 1,
      pageSize: 20,
      q: "backend",
    });
    expect(roleSearch.applications.map((item) => item.id)).toEqual([overdue.id]);
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

    const moved = await getApplication(user.id, application.id);
    expect(moved.status).toBe("INTERVIEW");

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
