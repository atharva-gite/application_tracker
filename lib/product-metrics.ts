import { MANAGEMENT_EVENT_NAMES, PRODUCT_EVENTS } from "@/lib/product-events";

export type ProductEventRow = {
  userId: string;
  name: string;
  createdAt: Date;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const managementEvents = new Set<string>(MANAGEMENT_EVENT_NAMES);

export function activationRate(events: ProductEventRow[]) {
  const signupAt = new Map<string, Date>();
  for (const event of events) {
    if (event.name !== PRODUCT_EVENTS.signupCompleted) {
      continue;
    }
    const existing = signupAt.get(event.userId);
    if (!existing || event.createdAt < existing) {
      signupAt.set(event.userId, event.createdAt);
    }
  }

  let activated = 0;
  for (const [userId, signedUpAt] of signupAt) {
    const windowEnd = signedUpAt.getTime() + WEEK_MS;
    const created = events.filter(
      (event) =>
        event.userId === userId &&
        event.name === PRODUCT_EVENTS.applicationCreated &&
        event.createdAt.getTime() >= signedUpAt.getTime() &&
        event.createdAt.getTime() <= windowEnd,
    ).length;
    if (created >= 3) {
      activated += 1;
    }
  }

  const signups = signupAt.size;
  return {
    activated,
    signups,
    rate: signups === 0 ? 0 : activated / signups,
  };
}

export function weeklyActiveManagers(input: {
  events: ProductEventRow[];
  activeUserIds: string[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const since = now.getTime() - WEEK_MS;
  const active = new Set(input.activeUserIds);
  const managers = new Set<string>();

  for (const event of input.events) {
    if (!active.has(event.userId) || !managementEvents.has(event.name)) {
      continue;
    }
    const at = event.createdAt.getTime();
    if (at >= since && at <= now.getTime()) {
      managers.add(event.userId);
    }
  }

  return managers.size;
}
