import type { Prisma } from "@prisma/client";

import { isUniqueConstraintError, normalizeCompanyName } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import type { CompanyInput, CompanyListQuery } from "@/lib/validation/company";

export const companyRepository = {
  findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });
  },
  findByNormalizedName(userId: string, normalizedName: string) {
    return prisma.company.findUnique({
      where: { userId_normalizedName: { userId, normalizedName } },
    });
  },
  async list(userId: string, query: CompanyListQuery) {
    const where: Prisma.CompanyWhereInput = {
      userId,
      ...(query.q
        ? { name: { contains: query.q, mode: "insensitive" } }
        : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        include: { _count: { select: { applications: true } } },
        orderBy: { name: "asc" },
        skip,
        take: query.pageSize,
      }),
      prisma.company.count({ where }),
    ]);
    return { items, total };
  },
  create(userId: string, input: CompanyInput) {
    return prisma.company.create({
      data: {
        userId,
        name: input.name.trim(),
        normalizedName: normalizeCompanyName(input.name),
        website: input.website,
        industry: input.industry,
        location: input.location,
        notes: input.notes,
      },
      include: { _count: { select: { applications: true } } },
    });
  },
  update(id: string, input: Partial<CompanyInput>) {
    return prisma.company.update({
      where: { id },
      data: {
        ...(input.name
          ? {
              name: input.name.trim(),
              normalizedName: normalizeCompanyName(input.name),
            }
          : {}),
        website: input.website,
        industry: input.industry,
        location: input.location,
        notes: input.notes,
      },
      include: { _count: { select: { applications: true } } },
    });
  },
  delete(id: string) {
    return prisma.company.delete({ where: { id } });
  },
  async findOrCreate(
    userId: string,
    input: { name: string; website?: string },
  ) {
    const normalizedName = normalizeCompanyName(input.name);
    const existing = await this.findByNormalizedName(userId, normalizedName);
    if (existing) {
      return existing;
    }

    try {
      return await prisma.company.create({
        data: {
          userId,
          name: input.name.trim(),
          normalizedName,
          website: input.website,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const raced = await this.findByNormalizedName(userId, normalizedName);
        if (raced) {
          return raced;
        }
      }
      throw error;
    }
  },
};
