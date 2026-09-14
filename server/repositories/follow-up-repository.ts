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
  create(userId: string, applicationId: string, input: FollowUpInput) {
    return prisma.followUp.create({
      data: {
        userId,
        applicationId,
        dueAt: new Date(input.dueAt),
        type: input.type,
        note: input.note,
      },
    });
  },
  update(
    id: string,
    input: Partial<FollowUpInput> & { completed?: boolean },
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
        ...(input.dueAt ? { dueAt: new Date(input.dueAt) } : {}),
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
