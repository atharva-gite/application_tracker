import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { PRODUCT_EVENTS } from "@/lib/product-events";
import { followUpInputSchema } from "@/lib/validation/follow-up";
import { parseSchema } from "@/lib/validation/helpers";
import { getDashboard } from "@/server/services/dashboard-service";
import { isDashboardFollowUp } from "@/lib/application-detail";
import {
  completeFollowUp,
  createFollowUp,
  listApplicationFollowUps,
  updateFollowUp,
} from "@/server/services/follow-up-service";
import { processDueFollowUpReminders } from "@/server/services/reminder-service";
import { FOLLOW_UP_REMINDER_TYPE } from "@/server/repositories/notification-repository";
import {
  createTestApplication,
  createTestUser,
  ensureDatabase,
} from "@/tests/helpers/db";

describe("follow-up workflow", () => {
  it("creates, edits, and completes a follow-up without deleting it", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Follow Up Owner");
    const application = await createTestApplication(user.id, {
      companyName: "Stripe",
      roleTitle: "Backend Intern",
    });

    const created = await createFollowUp(
      user.id,
      application.id,
      parseSchema(followUpInputSchema, {
        dueAt: "2026-09-17T09:00",
        type: "RECRUITER",
        note: "Follow up with recruiter",
        timeZone: "UTC",
      }),
    );
    expect(created.note).toBe("Follow up with recruiter");
    expect(created.completedAt).toBeNull();

    const edited = await updateFollowUp(user.id, created.id, {
      dueAt: "2026-09-18T10:00",
      type: "STATUS_CHECK",
      note: "Check application status",
      timeZone: "UTC",
    });
    expect(edited.type).toBe("STATUS_CHECK");
    expect(edited.note).toBe("Check application status");
    expect(edited.dueAt).toBe("2026-09-18T10:00:00.000Z");

    const completed = await completeFollowUp(user.id, created.id);
    expect(completed.completedAt).toBeTruthy();

    const again = await completeFollowUp(user.id, created.id);
    expect(again.completedAt).toBe(completed.completedAt);
    expect(
      await prisma.productEvent.count({
        where: { userId: user.id, name: PRODUCT_EVENTS.followUpCompleted, entityId: created.id },
      }),
    ).toBe(1);

    const listed = await listApplicationFollowUps(user.id, application.id);
    expect(listed.followUps.map((item) => item.id)).toEqual([created.id]);
    expect(listed.followUps[0]?.completedAt).toBe(completed.completedAt);

    const persisted = await prisma.followUp.findUnique({ where: { id: created.id } });
    expect(persisted?.completedAt).not.toBeNull();
  });

  it("returns the existing follow-up when the same create is submitted twice", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Follow Up Dup");
    const application = await createTestApplication(user.id, {
      companyName: "Notion",
      roleTitle: "Product Intern",
    });
    const input = parseSchema(followUpInputSchema, {
      dueAt: "2026-09-19T09:00",
      type: "THANK_YOU",
      note: "Send thank-you email",
      timeZone: "UTC",
    });
    const first = await createFollowUp(user.id, application.id, input);
    const second = await createFollowUp(user.id, application.id, input);
    expect(second.id).toBe(first.id);
    await expect(prisma.followUp.count({ where: { applicationId: application.id } })).resolves.toBe(
      1,
    );
  });

  it("surfaces overdue and today's follow-ups on the dashboard and hides completed ones", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Follow Up Dash");
    const application = await createTestApplication(user.id, {
      companyName: "Google",
      roleTitle: "SWE Intern",
    });
    const now = new Date();
    const overdue = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const today = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const upcoming = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const overdueItem = await createFollowUp(user.id, application.id, {
      dueAt: overdue,
      type: "RECRUITER",
    });
    const todayItem = await createFollowUp(user.id, application.id, {
      dueAt: today,
      type: "HIRING_MANAGER",
    });
    const upcomingItem = await createFollowUp(user.id, application.id, {
      dueAt: upcoming,
      type: "THANK_YOU",
    });

    const dashboard = await getDashboard(user.id);
    const openIds = dashboard.followUps.map((item) => item.id);
    expect(openIds).toEqual(expect.arrayContaining([overdueItem.id, todayItem.id, upcomingItem.id]));
    expect(isDashboardFollowUp(overdueItem.dueAt, overdueItem.completedAt, now, "UTC")).toBe(true);
    expect(isDashboardFollowUp(todayItem.dueAt, todayItem.completedAt, now, "UTC")).toBe(true);
    expect(isDashboardFollowUp(upcomingItem.dueAt, upcomingItem.completedAt, now, "UTC")).toBe(
      false,
    );

    await completeFollowUp(user.id, overdueItem.id);
    const after = await getDashboard(user.id);
    expect(after.followUps.map((item) => item.id)).not.toContain(overdueItem.id);
    expect(
      isDashboardFollowUp(
        overdueItem.dueAt,
        (await listApplicationFollowUps(user.id, application.id)).followUps.find(
          (item) => item.id === overdueItem.id,
        )?.completedAt,
        now,
        "UTC",
      ),
    ).toBe(false);
  });

  it("stores due times in the user timezone", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Follow Up TZ");
    const application = await createTestApplication(user.id, {
      companyName: "Tokyo Corp",
      roleTitle: "Intern",
    });
    const followUp = await createFollowUp(
      user.id,
      application.id,
      parseSchema(followUpInputSchema, {
        dueAt: "2026-09-15T08:00",
        type: "RECRUITER",
        timeZone: "Asia/Tokyo",
      }),
    );
    expect(followUp.dueAt).toBe("2026-09-14T23:00:00.000Z");
  });

  it("does not send a reminder twice and does not mark sent when email fails", async (context) => {
    await ensureDatabase(context);
    const user = await createTestUser("Follow Up Mail");
    const application = await createTestApplication(user.id, {
      companyName: "Meta",
      roleTitle: "ML Intern",
    });
    const followUp = await createFollowUp(user.id, application.id, {
      dueAt: new Date(Date.now() - 60_000).toISOString(),
      type: "RECRUITER",
    });

    const failing = {
      send: async () => {
        throw new Error("provider down");
      },
    };
    await processDueFollowUpReminders(new Date(), failing);
    const unsent = await prisma.notification.findUnique({
      where: {
        type_entityId: { type: FOLLOW_UP_REMINDER_TYPE, entityId: followUp.id },
      },
    });
    expect(unsent?.sentAt).toBeNull();

    const sends: string[] = [];
    const succeeding = {
      send: async (message: { to: string }) => {
        sends.push(message.to);
      },
    };
    await processDueFollowUpReminders(new Date(), succeeding);
    await processDueFollowUpReminders(new Date(), succeeding);
    expect(sends.filter((to) => to === user.email)).toHaveLength(1);

    const sent = await prisma.notification.findUnique({
      where: {
        type_entityId: { type: FOLLOW_UP_REMINDER_TYPE, entityId: followUp.id },
      },
    });
    expect(sent?.sentAt).not.toBeNull();
  });

  it("prevents another user from completing a follow-up", async (context) => {
    await ensureDatabase(context);
    const owner = await createTestUser("Follow Up Auth A");
    const other = await createTestUser("Follow Up Auth B");
    const application = await createTestApplication(owner.id, {
      companyName: "Linear",
      roleTitle: "Intern",
    });
    const followUp = await createFollowUp(owner.id, application.id, {
      dueAt: new Date().toISOString(),
      type: "RECRUITER",
    });

    await expect(completeFollowUp(other.id, followUp.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(listApplicationFollowUps(other.id, application.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    const stillOpen = await prisma.followUp.findUnique({ where: { id: followUp.id } });
    expect(stillOpen?.completedAt).toBeNull();
  });
});
