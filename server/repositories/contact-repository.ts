import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ContactInput, ContactListQuery } from "@/lib/validation/contact";

const include = { company: true } satisfies Prisma.ContactInclude;

export const contactRepository = {
  findById(id: string) {
    return prisma.contact.findUnique({ where: { id }, include });
  },
  async list(userId: string, query: ContactListQuery) {
    const where: Prisma.ContactWhereInput = {
      userId,
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { role: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        include,
        orderBy: { name: "asc" },
        skip,
        take: query.pageSize,
      }),
      prisma.contact.count({ where }),
    ]);
    return { items, total };
  },
  listForApplication(applicationId: string) {
    return prisma.applicationContact.findMany({
      where: { applicationId },
      include: { contact: { include } },
    });
  },
  create(userId: string, input: ContactInput) {
    return prisma.contact.create({
      data: {
        userId,
        companyId: input.companyId,
        name: input.name,
        role: input.role,
        email: input.email,
        linkedinUrl: input.linkedinUrl,
      },
      include,
    });
  },
  update(id: string, input: Partial<ContactInput>) {
    return prisma.contact.update({
      where: { id },
      data: input,
      include,
    });
  },
  delete(id: string) {
    return prisma.contact.delete({ where: { id } });
  },
  linkToApplication(
    applicationId: string,
    contactId: string,
    relationshipType?: string,
  ) {
    return prisma.applicationContact.upsert({
      where: {
        applicationId_contactId: { applicationId, contactId },
      },
      create: { applicationId, contactId, relationshipType },
      update: { relationshipType },
    });
  },
  unlinkFromApplication(applicationId: string, contactId: string) {
    return prisma.applicationContact.delete({
      where: { applicationId_contactId: { applicationId, contactId } },
    });
  },
};
