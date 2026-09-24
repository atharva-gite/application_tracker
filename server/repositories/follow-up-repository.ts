import { prisma } from "@/lib/prisma";
import type { FollowUpInput } from "@/lib/validation/follow-up";

const withApplication = {
  application: { include: { company: true } },
} as const;

export const followUpRepository = {
  findById(id: string) {
    return prisma.followUp.findUnique({
      where: { id },
      include: withApplication,
    });
  },
  listForApplication(applicationId: string) {
    return prisma.followUp.findMany({
      where: { applicationId },
      orderBy: { dueAt: "asc" },
    });
  },
  listOpen(userId: string, take = 20) {
    return prisma.followUp.findMany({
      where: {
        userId,
        completedAt: null,
        application: { archivedAt: null },
      },
      include: withApplication,
      orderBy: { dueAt: "asc" },
      take,
    });
  },
  findRecentDuplicate(input: {
    userId: string;
    applicationId: string;
    type: FollowUpInput["type"];
    dueAt: Date;
    note: string | null;
    since: Date;
  }) {
    return prisma.followUp.findFirst({
      where: {
        userId: input.userId,
        applicationId: input.applicationId,
        type: input.type,
        dueAt: input.dueAt,
        note: input.note,
        completedAt: null,
        createdAt: { gte: input.since },
      },
      orderBy: { createdAt: "desc" },
      include: withApplication,
    });
  },
  create(userId: string, applicationId: string, input: FollowUpInput, dueAt: Date) {
    return prisma.followUp.create({
      data: {
        userId,
        applicationId,
        dueAt,
        type: input.type,
        note: input.note,
      },
      include: withApplication,
    });
  },
  update(
    id: string,
    input: Partial<Pick<FollowUpInput, "type" | "note">> & { completed?: boolean },
    dueAt?: Date,
  ) {
    const completedAt =
      input.completed === undefined
        ? undefined
        : input.completed
          ? new Date()
          : null;
    return prisma.followUp.update({
      where: { id },
      data: {
        ...(dueAt ? { dueAt } : {}),
        type: input.type,
        note: input.note,
        ...(completedAt !== undefined ? { completedAt } : {}),
      },
      include: withApplication,
    });
  },
  delete(id: string) {
    return prisma.followUp.delete({ where: { id } });
  },
};
