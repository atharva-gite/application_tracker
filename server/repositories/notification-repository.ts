import { prisma } from "@/lib/prisma";

export const FOLLOW_UP_REMINDER_TYPE = "FOLLOW_UP_REMINDER";

export const notificationRepository = {
  upsertFollowUpReminder(input: {
    userId: string;
    followUpId: string;
    title: string;
    message: string;
    scheduledFor: Date;
    resetSent?: boolean;
  }) {
    return prisma.notification.upsert({
      where: {
        type_entityId: {
          type: FOLLOW_UP_REMINDER_TYPE,
          entityId: input.followUpId,
        },
      },
      create: {
        userId: input.userId,
        type: FOLLOW_UP_REMINDER_TYPE,
        entityType: "FollowUp",
        entityId: input.followUpId,
        title: input.title,
        message: input.message,
        scheduledFor: input.scheduledFor,
      },
      update: {
        title: input.title,
        message: input.message,
        scheduledFor: input.scheduledFor,
        ...(input.resetSent ? { sentAt: null } : {}),
      },
    });
  },
  findFollowUpReminder(followUpId: string) {
    return prisma.notification.findUnique({
      where: {
        type_entityId: {
          type: FOLLOW_UP_REMINDER_TYPE,
          entityId: followUpId,
        },
      },
    });
  },
  cancelUnsentFollowUpReminder(followUpId: string) {
    return prisma.notification.updateMany({
      where: {
        type: FOLLOW_UP_REMINDER_TYPE,
        entityId: followUpId,
        sentAt: null,
      },
      data: { scheduledFor: null },
    });
  },
  listDueFollowUpReminders(now: Date) {
    return prisma.notification.findMany({
      where: {
        type: FOLLOW_UP_REMINDER_TYPE,
        sentAt: null,
        scheduledFor: { lte: now },
        entityId: { not: null },
      },
      orderBy: { scheduledFor: "asc" },
      take: 100,
    });
  },
  markSent(id: string, sentAt = new Date()) {
    return prisma.notification.updateMany({
      where: { id, sentAt: null },
      data: { sentAt },
    });
  },
  unmarkSent(id: string) {
    return prisma.notification.updateMany({
      where: { id, sentAt: { not: null } },
      data: { sentAt: null },
    });
  },
};
