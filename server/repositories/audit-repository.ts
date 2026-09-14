import { prisma } from "@/lib/prisma";

export const auditRepository = {
  listForUser(userId: string, take = 20) {
    return prisma.auditEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  },
};
