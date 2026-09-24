import type { ApplicationStatus, Prisma } from "@prisma/client";

import { toDateOnly } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { PRODUCT_EVENTS } from "@/lib/product-events";
import { productEventRepository } from "@/server/repositories/product-event-repository";
import type {
  ApplicationCreateInput,
  ApplicationListQuery,
  ApplicationUpdateInput,
} from "@/lib/validation/application";

const applicationInclude = {
  company: true,
} satisfies Prisma.ApplicationInclude;

const listInclude = {
  company: true,
  statusHistory: {
    orderBy: { changedAt: "desc" as const },
    take: 1,
    select: { changedAt: true },
  },
  notes: {
    orderBy: { updatedAt: "desc" as const },
    take: 1,
    select: { createdAt: true, updatedAt: true },
  },
  interviews: {
    orderBy: { updatedAt: "desc" as const },
    take: 1,
    select: { createdAt: true, updatedAt: true },
  },
  followUps: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: { createdAt: true, completedAt: true },
  },
} satisfies Prisma.ApplicationInclude;

function localDateOnly(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addLocalDays(days: number, now = new Date()) {
  return localDateOnly(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + days),
  );
}

function listDeadline(
  query: ApplicationListQuery,
): Prisma.ApplicationWhereInput["deadline"] {
  if (query.due === "none") {
    return null;
  }

  const today = toDateOnly(localDateOnly());
  const tomorrow = toDateOnly(addLocalDays(1));
  const filter: Prisma.DateTimeFilter = {};

  if (query.due === "overdue") {
    filter.lt = today;
  } else if (query.due === "today") {
    filter.equals = today;
  } else if (query.due === "tomorrow") {
    filter.equals = tomorrow;
  } else if (query.due === "upcoming") {
    filter.gt = tomorrow;
  }
  if (query.deadlineFrom) {
    filter.gte = toDateOnly(query.deadlineFrom);
  }
  if (query.deadlineTo) {
    filter.lte = toDateOnly(query.deadlineTo);
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

function listOrderBy(
  sort: ApplicationListQuery["sort"],
  order: NonNullable<ApplicationListQuery["order"]>,
): Prisma.ApplicationOrderByWithRelationInput {
  if (sort === "lastActivity" || sort === "updatedAt" || !sort) {
    return { updatedAt: order };
  }
  if (sort === "company") {
    return { company: { name: order } };
  }
  if (sort === "deadline") {
    return { deadline: { sort: order, nulls: "last" } };
  }
  return { [sort]: order };
}

function listWhere(userId: string, query: ApplicationListQuery): Prisma.ApplicationWhereInput {
  const archived = query.archived ?? "false";
  const deadline = listDeadline(query);
  return {
    userId,
    ...(archived === "false" ? { archivedAt: null } : {}),
    ...(archived === "only" ? { archivedAt: { not: null } } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.location
      ? { location: { contains: query.location, mode: "insensitive" } }
      : {}),
    ...(query.source
      ? { source: { contains: query.source, mode: "insensitive" } }
      : {}),
    ...(deadline !== undefined ? { deadline } : {}),
    ...(query.appliedFrom || query.appliedTo
      ? {
          applicationDate: {
            ...(query.appliedFrom ? { gte: toDateOnly(query.appliedFrom) } : {}),
            ...(query.appliedTo ? { lte: toDateOnly(query.appliedTo) } : {}),
          },
        }
      : {}),
    ...(query.q
      ? {
          OR: [
            { roleTitle: { contains: query.q, mode: "insensitive" } },
            { location: { contains: query.q, mode: "insensitive" } },
            { source: { contains: query.q, mode: "insensitive" } },
            { company: { name: { contains: query.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

export const applicationRepository = {
  findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: applicationInclude,
    });
  },
  async list(userId: string, query: ApplicationListQuery) {
    const where = listWhere(userId, query);
    const skip = (query.page - 1) * query.pageSize;
    const orderBy = listOrderBy(query.sort, query.order ?? "desc");

    const [items, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: listInclude,
        orderBy,
        skip,
        take: query.pageSize,
      }),
      prisma.application.count({ where }),
    ]);
    return { items, total };
  },
  touch(id: string) {
    return prisma.application.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  },
  countByStatus(userId: string) {
    return prisma.application.groupBy({
      by: ["status"],
      where: { userId, archivedAt: null },
      _count: { _all: true },
    });
  },
  listForExport(userId: string) {
    return prisma.application.findMany({
      where: { userId, archivedAt: null },
      include: { company: true },
      orderBy: { createdAt: "asc" },
    });
  },
  create(data: {
    userId: string;
    companyId: string;
    input: ApplicationCreateInput;
  }) {
    return prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          userId: data.userId,
          companyId: data.companyId,
          roleTitle: data.input.roleTitle,
          jobUrl: data.input.jobUrl,
          location: data.input.location,
          employmentType: data.input.employmentType,
          status: data.input.status,
          applicationDate: data.input.applicationDate
            ? toDateOnly(data.input.applicationDate)
            : undefined,
          deadline: data.input.deadline ? toDateOnly(data.input.deadline) : undefined,
          source: data.input.source,
          salaryMin: data.input.salaryMin,
          salaryMax: data.input.salaryMax,
          salaryCurrency: data.input.salaryCurrency,
          description: data.input.description,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: null,
          toStatus: application.status,
        },
      });

      if (data.input.documentId) {
        await tx.applicationDocument.create({
          data: {
            applicationId: application.id,
            documentId: data.input.documentId,
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          userId: data.userId,
          entityType: "application",
          entityId: application.id,
          action: "created",
          metadata: {
            status: application.status,
            documentId: data.input.documentId,
          },
        },
      });
      await productEventRepository.record(
        {
          userId: data.userId,
          name: PRODUCT_EVENTS.applicationCreated,
          entityId: application.id,
        },
        tx,
      );

      return tx.application.findUniqueOrThrow({
        where: { id: application.id },
        include: applicationInclude,
      });
    });
  },
  update(
    id: string,
    userId: string,
    input: ApplicationUpdateInput,
    companyId?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.application.findUniqueOrThrow({ where: { id } });
      const nextStatus = input.status ?? current.status;
      const archivedAt =
        input.archived === undefined
          ? undefined
          : input.archived
            ? current.archivedAt ?? new Date()
            : null;

      const application = await tx.application.update({
        where: { id },
        data: {
          ...(companyId ? { companyId } : {}),
          ...(input.roleTitle ? { roleTitle: input.roleTitle } : {}),
          jobUrl: input.jobUrl,
          location: input.location,
          employmentType: input.employmentType,
          status: nextStatus,
          applicationDate:
            input.applicationDate === undefined
              ? undefined
              : toDateOnly(input.applicationDate),
          deadline:
            input.deadline === undefined ? undefined : toDateOnly(input.deadline),
          source: input.source,
          salaryMin: input.salaryMin,
          salaryMax: input.salaryMax,
          salaryCurrency: input.salaryCurrency,
          description: input.description,
          ...(archivedAt !== undefined ? { archivedAt } : {}),
        },
      });

      if (nextStatus !== current.status) {
        await tx.applicationStatusHistory.create({
          data: {
            applicationId: id,
            fromStatus: current.status,
            toStatus: nextStatus,
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          userId,
          entityType: "application",
          entityId: id,
          action: nextStatus !== current.status ? "status_changed" : "updated",
          metadata: {
            fromStatus: current.status,
            toStatus: nextStatus,
          },
        },
      });
      if (nextStatus !== current.status) {
        await productEventRepository.record(
          {
            userId,
            name: PRODUCT_EVENTS.applicationStatusChanged,
            entityId: id,
          },
          tx,
        );
      }

      return tx.application.findUniqueOrThrow({
        where: { id: application.id },
        include: applicationInclude,
      });
    });
  },
  changeStatus(id: string, userId: string, toStatus: ApplicationStatus) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.application.findUniqueOrThrow({ where: { id } });
      if (current.status === toStatus) {
        return tx.application.findUniqueOrThrow({
          where: { id },
          include: applicationInclude,
        });
      }

      await tx.application.update({
        where: { id },
        data: { status: toStatus },
      });
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: current.status,
          toStatus,
        },
      });
      await tx.auditEvent.create({
        data: {
          userId,
          entityType: "application",
          entityId: id,
          action: "status_changed",
          metadata: { fromStatus: current.status, toStatus },
        },
      });
      await productEventRepository.record(
        {
          userId,
          name: PRODUCT_EVENTS.applicationStatusChanged,
          entityId: id,
        },
        tx,
      );

      return tx.application.findUniqueOrThrow({
        where: { id },
        include: applicationInclude,
      });
    });
  },
  archive(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const application = await tx.application.update({
        where: { id },
        data: { archivedAt: new Date() },
        include: applicationInclude,
      });
      await tx.auditEvent.create({
        data: {
          userId,
          entityType: "application",
          entityId: id,
          action: "archived",
        },
      });
      return application;
    });
  },
  listHistory(applicationId: string) {
    return prisma.applicationStatusHistory.findMany({
      where: { applicationId },
      orderBy: { changedAt: "asc" },
    });
  },
};
