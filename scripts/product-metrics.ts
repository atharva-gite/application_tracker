import { prisma } from "@/lib/prisma";
import { activationRate, weeklyActiveManagers } from "@/lib/product-metrics";

const ACTIVE_STATUSES = ["SAVED", "APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER"] as const;

async function main() {
  const [events, activeUsers] = await Promise.all([
    prisma.productEvent.findMany({
      select: { userId: true, name: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { archivedAt: null, status: { in: [...ACTIVE_STATUSES] } },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

  const activation = activationRate(events);
  const weekly = weeklyActiveManagers({
    events,
    activeUserIds: activeUsers.map((user) => user.userId),
  });

  if (activation.signups === 0) {
    console.log("Activation: 0 (no signups)");
  } else {
    const percent = Math.round(activation.rate * 1000) / 10;
    console.log(
      `Activation: ${percent}% (${activation.activated} of ${activation.signups} signups)`,
    );
  }
  console.log(`Weekly active application managers: ${weekly}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
