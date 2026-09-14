import type { DocumentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { DocumentMetaInput } from "@/lib/validation/document";

export const documentRepository = {
  findById(id: string) {
    return prisma.document.findUnique({ where: { id } });
  },
  list(userId: string, query: { page: number; pageSize: number; type?: DocumentType }) {
    const where = {
      userId,
      ...(query.type ? { type: query.type } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    return prisma.$transaction([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
      }),
      prisma.document.count({ where }),
    ]);
  },
  listForApplication(applicationId: string) {
    return prisma.applicationDocument.findMany({
      where: { applicationId },
      include: { document: true },
    });
  },
  create(
    userId: string,
    input: DocumentMetaInput & {
      filename: string;
      mimeType: string;
      fileSize: number;
      storageKey: string;
    },
  ) {
    return prisma.document.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        filename: input.filename,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        storageKey: input.storageKey,
      },
    });
  },
  delete(id: string) {
    return prisma.document.delete({ where: { id } });
  },
  linkToApplication(applicationId: string, documentId: string) {
    return prisma.applicationDocument.upsert({
      where: { applicationId_documentId: { applicationId, documentId } },
      create: { applicationId, documentId },
      update: {},
    });
  },
  unlinkFromApplication(applicationId: string, documentId: string) {
    return prisma.applicationDocument.delete({
      where: { applicationId_documentId: { applicationId, documentId } },
    });
  },
};
