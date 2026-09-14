import type { ApplicationStatus } from "@prisma/client";

import { APPLICATION_STATUSES } from "@/lib/validation/application";

export function conversionRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }
  return Number((numerator / denominator).toFixed(3));
}

export type StageHistoryEntry = {
  applicationId: string;
  toStatus: ApplicationStatus;
  changedAt: Date;
};

export function averageStageDurationDays(
  history: StageHistoryEntry[],
  now = new Date(),
) {
  const totals = new Map<ApplicationStatus, { ms: number; samples: number }>();
  const byApplication = new Map<string, StageHistoryEntry[]>();

  for (const entry of history) {
    const list = byApplication.get(entry.applicationId) ?? [];
    list.push(entry);
    byApplication.set(entry.applicationId, list);
  }

  const nowMs = now.getTime();
  for (const entries of byApplication.values()) {
    const ordered = [...entries].sort(
      (left, right) => left.changedAt.getTime() - right.changedAt.getTime(),
    );
    for (let index = 0; index < ordered.length; index += 1) {
      const current = ordered[index];
      const next = ordered[index + 1];
      const end = next ? next.changedAt.getTime() : nowMs;
      const elapsed = Math.max(0, end - current.changedAt.getTime());
      const existing = totals.get(current.toStatus) ?? { ms: 0, samples: 0 };
      totals.set(current.toStatus, {
        ms: existing.ms + elapsed,
        samples: existing.samples + 1,
      });
    }
  }

  return APPLICATION_STATUSES.map((status) => {
    const stats = totals.get(status);
    return {
      status,
      averageDays:
        !stats || stats.samples === 0
          ? 0
          : Number((stats.ms / stats.samples / (24 * 60 * 60 * 1000)).toFixed(1)),
    };
  });
}

export function isAllowedStatusTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
) {
  return (
    (APPLICATION_STATUSES as readonly string[]).includes(from) &&
    (APPLICATION_STATUSES as readonly string[]).includes(to)
  );
}
