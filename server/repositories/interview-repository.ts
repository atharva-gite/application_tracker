import { prisma } from "@/lib/prisma";
import type { InterviewInput } from "@/lib/validation/interview";

const withApplication = {
  application: { include: { company: true } },
} as const;

export const interviewRepository = {
  findById(id: string) {
    return prisma.interview.findUnique({
      where: { id },
      include: withApplication,
    });
  },
  listForApplication(applicationId: string) {
    return prisma.interview.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: "asc" },
    });
  },
  listUpcoming(userId: string, take = 20) {
    return prisma.interview.findMany({
      where: {
        application: { userId, archivedAt: null },
        status: "SCHEDULED",
      },
      include: withApplication,
      orderBy: { scheduledAt: "asc" },
      take,
    });
  },
  listForUser(userId: string, take = 50) {
    return prisma.interview.findMany({
      where: {
        application: { userId, archivedAt: null },
        status: { not: "CANCELLED" },
      },
      include: withApplication,
      orderBy: { scheduledAt: "asc" },
      take,
    });
  },
  create(applicationId: string, input: InterviewInput) {
    return prisma.interview.create({
      data: {
        applicationId,
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes,
        type: input.type,
        interviewerName: input.interviewerName,
        meetingUrl: input.meetingUrl,
        status: input.status,
        outcome: input.outcome,
        notes: input.notes,
      },
    });
  },
  update(id: string, input: Partial<InterviewInput>) {
    return prisma.interview.update({
      where: { id },
      data: {
        ...(input.scheduledAt ? { scheduledAt: new Date(input.scheduledAt) } : {}),
        durationMinutes: input.durationMinutes,
        type: input.type,
        interviewerName: input.interviewerName,
        meetingUrl: input.meetingUrl,
        status: input.status,
        outcome: input.outcome,
        notes: input.notes,
      },
      include: withApplication,
    });
  },
  delete(id: string) {
    return prisma.interview.delete({ where: { id } });
  },
};
