import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { PRODUCT_EVENTS } from "@/lib/product-events";

export const DEMO_EMAIL = "demo@folio.local";
export const DEMO_PASSWORD = "password12";

export function assertDevSeed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed while NODE_ENV=production.");
  }
}

function daysAgo(now: Date, days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

async function resetDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!existing) {
    return;
  }
  await prisma.application.deleteMany({ where: { userId: existing.id } });
  await prisma.company.deleteMany({ where: { userId: existing.id } });
  await prisma.user.delete({ where: { id: existing.id } });
}

async function main() {
  assertDevSeed();
  const now = new Date();
  await resetDemoUser();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo Student",
      passwordHash,
      timezone: "Europe/London",
      createdAt: daysAgo(now, 30),
    },
  });

  const stripe = await prisma.company.create({
    data: {
      userId: user.id,
      name: "Stripe",
      normalizedName: "stripe",
    },
  });
  const google = await prisma.company.create({
    data: {
      userId: user.id,
      name: "Google",
      normalizedName: "google",
    },
  });
  const notion = await prisma.company.create({
    data: {
      userId: user.id,
      name: "Notion",
      normalizedName: "notion",
    },
  });
  const figma = await prisma.company.create({
    data: {
      userId: user.id,
      name: "Figma",
      normalizedName: "figma",
    },
  });
  const adobe = await prisma.company.create({
    data: {
      userId: user.id,
      name: "Adobe",
      normalizedName: "adobe",
    },
  });

  const offer = await prisma.application.create({
    data: {
      userId: user.id,
      companyId: stripe.id,
      roleTitle: "Software Engineer",
      status: "OFFER",
      source: "Referral",
      location: "London",
      applicationDate: daysAgo(now, 28),
      createdAt: daysAgo(now, 29),
    },
  });
  const interviewApp = await prisma.application.create({
    data: {
      userId: user.id,
      companyId: google.id,
      roleTitle: "Software Engineering Intern",
      status: "INTERVIEW",
      source: "Career page",
      location: "London",
      jobUrl: "https://careers.google.com",
      applicationDate: daysAgo(now, 27),
      createdAt: daysAgo(now, 28),
    },
  });
  const stalled = await prisma.application.create({
    data: {
      userId: user.id,
      companyId: notion.id,
      roleTitle: "Product Engineer Intern",
      status: "APPLIED",
      source: "LinkedIn",
      location: "Remote",
      applicationDate: daysAgo(now, 16),
      createdAt: daysAgo(now, 16),
    },
  });
  const saved = await prisma.application.create({
    data: {
      userId: user.id,
      companyId: figma.id,
      roleTitle: "Design Engineer",
      status: "SAVED",
      location: "New York",
      createdAt: daysAgo(now, 1),
    },
  });
  const assessment = await prisma.application.create({
    data: {
      userId: user.id,
      companyId: adobe.id,
      roleTitle: "Frontend Intern",
      status: "ASSESSMENT",
      source: "University",
      location: "San Jose",
      applicationDate: daysAgo(now, 5),
      createdAt: daysAgo(now, 5),
    },
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: offer.id,
        toStatus: "OFFER",
        changedAt: daysAgo(now, 2),
      },
      {
        applicationId: interviewApp.id,
        fromStatus: "APPLIED",
        toStatus: "INTERVIEW",
        changedAt: daysAgo(now, 1),
      },
      {
        applicationId: stalled.id,
        toStatus: "APPLIED",
        changedAt: daysAgo(now, 16),
      },
      {
        applicationId: saved.id,
        toStatus: "SAVED",
        changedAt: daysAgo(now, 1),
      },
      {
        applicationId: assessment.id,
        toStatus: "ASSESSMENT",
        changedAt: daysAgo(now, 5),
      },
    ],
  });

  await prisma.interview.create({
    data: {
      applicationId: interviewApp.id,
      scheduledAt: new Date(now.getTime() + 26 * 60 * 60 * 1000),
      type: "TECHNICAL",
      interviewerName: "Jane Doe",
      status: "SCHEDULED",
    },
  });
  await prisma.followUp.create({
    data: {
      userId: user.id,
      applicationId: interviewApp.id,
      dueAt: daysAgo(now, 2),
      type: "RECRUITER",
      note: "Follow up with recruiter",
    },
  });

  await prisma.productEvent.createMany({
    data: [
      {
        userId: user.id,
        name: PRODUCT_EVENTS.signupCompleted,
        createdAt: daysAgo(now, 30),
      },
      {
        userId: user.id,
        name: PRODUCT_EVENTS.applicationCreated,
        entityId: offer.id,
        createdAt: daysAgo(now, 29),
      },
      {
        userId: user.id,
        name: PRODUCT_EVENTS.applicationCreated,
        entityId: interviewApp.id,
        createdAt: daysAgo(now, 28),
      },
      {
        userId: user.id,
        name: PRODUCT_EVENTS.applicationCreated,
        entityId: stalled.id,
        createdAt: daysAgo(now, 27),
      },
      {
        userId: user.id,
        name: PRODUCT_EVENTS.applicationCreated,
        entityId: saved.id,
        createdAt: daysAgo(now, 1),
      },
      {
        userId: user.id,
        name: PRODUCT_EVENTS.interviewCreated,
        createdAt: daysAgo(now, 1),
      },
    ],
  });

  console.log(`Seeded ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

const entry = process.argv[1] ?? "";
if (entry.endsWith("seed.ts") || entry.endsWith("seed.js")) {
  main()
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
