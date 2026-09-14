import { prisma } from "@/lib/prisma";
import type { NoteInput } from "@/lib/validation/note";

export const noteRepository = {
  findById(id: string) {
    return prisma.note.findUnique({
      where: { id },
      include: { application: true },
    });
  },
  listForApplication(applicationId: string) {
    return prisma.note.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });
  },
  create(userId: string, applicationId: string, input: NoteInput) {
    return prisma.note.create({
      data: {
        userId,
        applicationId,
        content: input.content,
      },
    });
  },
  update(id: string, input: Partial<NoteInput>) {
    return prisma.note.update({
      where: { id },
      data: input,
    });
  },
  delete(id: string) {
    return prisma.note.delete({ where: { id } });
  },
};
