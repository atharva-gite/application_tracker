import type { Prisma } from "@prisma/client";

import { buildJobSearchAnalytics } from "@/lib/analytics-math";
import {
  analyticsPeriodStart,
  type AnalyticsRange,
} from "@/lib/analytics-period";
import { prisma } from "@/lib/prisma";
import { auditRepository } from "@/server/repositories/audit-repository";

export function reachedInterviewWhere(): Prisma.ApplicationWhereInput {
  return {
    OR: [
      { status: { in: ["INTERVIEW", "OFFER"] } },
      { interviews: { some: {} } },
      { statusHistory: { some: { toStatus: { in: ["INTERVIEW", "OFFER"] } } } },
    ],
  };
}

export function applicationAnalyticsWhere(
  userId: string,
  range: AnalyticsRange = "all",
  now = new Date(),
): Prisma.ApplicationWhereInput {
  const since = analyticsPeriodStart(range, now);
  return {
    userId,
    archivedAt: null,
    ...(since
      ? {
          OR: [
            { applicationDate: { gte: since } },
            { applicationDate: null, createdAt: { gte: since } },
          ],
        }
      : {}),
  };
}

export async function getJobSearchAnalytics(
  userId: string,
  range: AnalyticsRange = "all",
  now = new Date(),
) {
  const applications = await prisma.application.findMany({
    where: applicationAnalyticsWhere(userId, range, now),
    select: {
      id: true,
      status: true,
      source: true,
      interviews: { select: { id: true }, take: 1 },
      statusHistory: {
        select: { toStatus: true, changedAt: true },
        orderBy: { changedAt: "asc" },
      },
    },
  });

  return buildJobSearchAnalytics(
    applications.map((row) => ({
      id: row.id,
      status: row.status,
      source: row.source,
      hasInterview: row.interviews.length > 0,
      history: row.statusHistory,
    })),
    range,
    now,
  );
}

export async function getAnalyticsOverview(
  userId: string,
  range: AnalyticsRange = "all",
  now = new Date(),
) {
  const analytics = await getJobSearchAnalytics(userId, range, now);
  return {
    range: analytics.range,
    applications: analytics.applications,
    applied: analytics.submitted,
    interviews: analytics.interviews,
    offers: analytics.offers,
    applicationToInterview: analytics.applicationToInterview,
    interviewToOffer: analytics.interviewToOffer,
    pipeline: Object.fromEntries(
      analytics.byStatus.map((row) => [row.status, row.count]),
    ),
  };
}

export async function getAnalyticsApplications(
  userId: string,
  range: AnalyticsRange = "all",
  now = new Date(),
) {
  const analytics = await getJobSearchAnalytics(userId, range, now);
  return {
    range: analytics.range,
    bySource: analytics.bySource,
    byStatus: analytics.byStatus,
  };
}

export async function getAnalyticsConversion(
  userId: string,
  range: AnalyticsRange = "all",
  now = new Date(),
) {
  const analytics = await getJobSearchAnalytics(userId, range, now);
  return {
    range: analytics.range,
    applied: analytics.submitted,
    interview: analytics.interviews,
    offer: analytics.offers,
    applicationToInterview: analytics.applicationToInterview,
    interviewToOffer: analytics.interviewToOffer,
  };
}

export async function getAnalyticsStageDuration(
  userId: string,
  range: AnalyticsRange = "all",
  now = new Date(),
) {
  const analytics = await getJobSearchAnalytics(userId, range, now);
  return {
    range: analytics.range,
    byStatus: analytics.timeInStage,
  };
}

export async function getAnalyticsActivity(userId: string) {
  const events = await auditRepository.listForUser(userId, 50);
  return {
    activity: events.map((event) => ({
      id: event.id,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      metadata: event.metadata,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
