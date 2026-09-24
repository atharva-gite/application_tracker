import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ProductEventName } from "@/lib/product-events";

type ProductEventDb = Prisma.TransactionClient | PrismaClient;

export const productEventRepository = {
  record(
    data: { userId: string; name: ProductEventName; entityId?: string | null },
    db: ProductEventDb = prisma,
  ) {
    return db.productEvent.create({
      data: {
        userId: data.userId,
        name: data.name,
        entityId: data.entityId ?? null,
      },
    });
  },
};
