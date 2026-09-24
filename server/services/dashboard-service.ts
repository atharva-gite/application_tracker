import type { ApplicationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { serializeFollowUp, serializeInterview } from "@/lib/serializers";
import { APPLICATION_STATUSES } from "@/lib/validation/application";
import { applicationRepository } from "@/server/repositories/application-repository";
import { auditRepository } from "@/server/repositories/audit-repository";
import { followUpRepository } from "@/server/repositories/follow-up-repository";
import { interviewRepository } from "@/server/repositories/interview-repository";
import { reachedInterviewWhere } from "@/server/services/analytics-service";

const ACTIVE_STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
];

export async function getDashboard(userId: string) {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    total,
    active,
    interviewsReached,
    offers,
    statusCounts,
    upcomingInterviews,
    followUps,
    upcomingDeadlines,
    activity,
    staleCandidates,
  ] = await Promise.all([
    prisma.application.count({ where: { userId, archivedAt: null } }),
    prisma.application.count({
      where: { userId, archivedAt: null, status: { in: ACTIVE_STATUSES } },
    }),
    prisma.application.count({
      where: {
        userId,
        archivedAt: null,
        ...reachedInterviewWhere(),
      },
    }),
    prisma.application.count({
      where: { userId, archivedAt: null, status: "OFFER" },
    }),
    applicationRepository.countByStatus(userId),
    interviewRepository.listUpcoming(userId, 20),
    followUpRepository.listOpen(userId, 50),
    prisma.application.findMany({
      where: {
        userId,
        archivedAt: null,
        deadline: { not: null, lte: inSevenDays },
        status: { in: ACTIVE_STATUSES },
      },
      include: { company: true },
      orderBy: { deadline: "asc" },
      take: 20,
    }),
    auditRepository.listForUser(userId, 12),
    prisma.application.findMany({
      where: {
        userId,
        archivedAt: null,
        status: { in: ["APPLIED", "ASSESSMENT"] },
      },
      select: {
        id: true,
        roleTitle: true,
        status: true,
        company: { select: { name: true } },
        statusHistory: {
          orderBy: { changedAt: "desc" },
          take: 1,
          select: { changedAt: true },
        },
      },
    }),
  ]);

  const pipeline = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [
      status,
      statusCounts.find((row) => row.status === status)?._count._all ?? 0,
    ]),
  );

  return {
    metrics: {
      applications: total,
      active,
      interviews: interviewsReached,
      offers,
    },
    pipeline,
    upcomingInterviews: upcomingInterviews.map(serializeInterview),
    followUps: followUps.map(serializeFollowUp),
    upcomingDeadlines: upcomingDeadlines.map((application) => ({
      id: application.id,
      roleTitle: application.roleTitle,
      company: application.company.name,
      deadline: application.deadline?.toISOString().slice(0, 10) ?? null,
      status: application.status,
    })),
    activity: activity.map((event) => ({
      id: event.id,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      metadata: event.metadata,
      createdAt: event.createdAt.toISOString(),
    })),
    staleCandidates: staleCandidates.map((application) => ({
      id: application.id,
      roleTitle: application.roleTitle,
      company: application.company.name,
      status: application.status,
      lastStatusChangedAt: application.statusHistory[0]?.changedAt.toISOString() ?? null,
    })),
  };
}

export {
  getAnalyticsActivity,
  getAnalyticsApplications,
  getAnalyticsConversion,
  getAnalyticsOverview,
  getAnalyticsStageDuration,
} from "@/server/services/analytics-service";
