import type { ApplicationStatus } from "@prisma/client";

import {
  averageStageDurationDays,
  conversionRate,
} from "@/lib/analytics-math";
import { prisma } from "@/lib/prisma";
import { serializeFollowUp, serializeInterview } from "@/lib/serializers";
import { APPLICATION_STATUSES } from "@/lib/validation/application";
import { applicationRepository } from "@/server/repositories/application-repository";
import { auditRepository } from "@/server/repositories/audit-repository";
import { followUpRepository } from "@/server/repositories/follow-up-repository";
import { interviewRepository } from "@/server/repositories/interview-repository";

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
  ] = await Promise.all([
    prisma.application.count({ where: { userId, archivedAt: null } }),
    prisma.application.count({
      where: { userId, archivedAt: null, status: { in: ACTIVE_STATUSES } },
    }),
    prisma.application.count({
      where: {
        userId,
        archivedAt: null,
        OR: [
          { status: "INTERVIEW" },
          { status: "OFFER" },
          { interviews: { some: {} } },
        ],
      },
    }),
    prisma.application.count({
      where: { userId, archivedAt: null, status: "OFFER" },
    }),
    applicationRepository.countByStatus(userId),
    interviewRepository.listUpcoming(userId, 8),
    followUpRepository.listOpen(userId, 8),
    prisma.application.findMany({
      where: {
        userId,
        archivedAt: null,
        deadline: { not: null, lte: inSevenDays },
        status: { in: ACTIVE_STATUSES },
      },
      include: { company: true },
      orderBy: { deadline: "asc" },
      take: 8,
    }),
    auditRepository.listForUser(userId, 12),
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
  };
}

export async function getAnalyticsOverview(userId: string) {
  const dashboard = await getDashboard(userId);
  const applied = await prisma.application.count({
    where: {
      userId,
      archivedAt: null,
      status: { not: "SAVED" },
    },
  });
  const conversion = conversionRate(dashboard.metrics.interviews, applied);

  return {
    ...dashboard.metrics,
    applied,
    applicationToInterview: conversion,
    pipeline: dashboard.pipeline,
  };
}

export async function getAnalyticsApplications(userId: string) {
  const bySource = await prisma.application.groupBy({
    by: ["source"],
    where: { userId, archivedAt: null },
    _count: { _all: true },
  });
  const byStatus = await applicationRepository.countByStatus(userId);
  return {
    bySource: bySource.map((row) => ({
      source: row.source ?? "Unspecified",
      count: row._count._all,
    })),
    byStatus: byStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
  };
}

export async function getAnalyticsConversion(userId: string) {
  const [applied, interview, offer] = await Promise.all([
    prisma.application.count({
      where: { userId, archivedAt: null, status: { not: "SAVED" } },
    }),
    prisma.application.count({
      where: {
        userId,
        archivedAt: null,
        OR: [{ status: { in: ["INTERVIEW", "OFFER"] } }, { interviews: { some: {} } }],
      },
    }),
    prisma.application.count({
      where: { userId, archivedAt: null, status: "OFFER" },
    }),
  ]);

  return {
    applied,
    interview,
    offer,
    applicationToInterview: conversionRate(interview, applied),
    interviewToOffer: conversionRate(offer, interview),
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

export async function getAnalyticsStageDuration(userId: string) {
  const history = await prisma.applicationStatusHistory.findMany({
    where: { application: { userId, archivedAt: null } },
    orderBy: { changedAt: "asc" },
  });

  return {
    byStatus: averageStageDurationDays(history),
  };
}
