import type { ApplicationStatus } from "@prisma/client";

import type { AnalyticsRange } from "@/lib/analytics-period";
import { APPLICATION_STATUSES } from "@/lib/validation/application";

export const RATE_MIN_SAMPLES = 3;

const CLOSED_STAGES: ApplicationStatus[] = ["REJECTED", "WITHDRAWN"];

export function conversionRate(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return null;
  }
  return Number((numerator / denominator).toFixed(3));
}

export function rateIsReady(
  denominator: number,
  minSamples = RATE_MIN_SAMPLES,
) {
  return denominator >= minSamples;
}

export function formatPercent(rate: number) {
  return `${(rate * 100).toFixed(1).replace(/\.0$/, "")}%`;
}

export function rateLabel(
  rate: number | null,
  denominator: number,
  minSamples = RATE_MIN_SAMPLES,
) {
  if (rate === null || !rateIsReady(denominator, minSamples)) {
    return "Not enough data yet";
  }
  return formatPercent(rate);
}

export type StageHistoryEntry = {
  applicationId: string;
  toStatus: ApplicationStatus;
  changedAt: Date;
};

export type StageDurationRow = {
  status: ApplicationStatus;
  averageDays: number | null;
  samples: number;
  completedSamples: number;
  openSamples: number;
};

export function averageStageDurationDays(
  history: StageHistoryEntry[],
  now = new Date(),
): StageDurationRow[] {
  const totals = new Map<
    ApplicationStatus,
    { ms: number; samples: number; completedSamples: number; openSamples: number }
  >();
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
      const isOpen = !next;
      if (isOpen && CLOSED_STAGES.includes(current.toStatus)) {
        continue;
      }
      const end = next ? next.changedAt.getTime() : nowMs;
      const elapsed = Math.max(0, end - current.changedAt.getTime());
      const existing = totals.get(current.toStatus) ?? {
        ms: 0,
        samples: 0,
        completedSamples: 0,
        openSamples: 0,
      };
      totals.set(current.toStatus, {
        ms: existing.ms + elapsed,
        samples: existing.samples + 1,
        completedSamples: existing.completedSamples + (isOpen ? 0 : 1),
        openSamples: existing.openSamples + (isOpen ? 1 : 0),
      });
    }
  }

  return APPLICATION_STATUSES.map((status) => {
    const stats = totals.get(status);
    return {
      status,
      averageDays:
        !stats || stats.samples === 0
          ? null
          : Number((stats.ms / stats.samples / (24 * 60 * 60 * 1000)).toFixed(1)),
      samples: stats?.samples ?? 0,
      completedSamples: stats?.completedSamples ?? 0,
      openSamples: stats?.openSamples ?? 0,
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

const INTERVIEW_ADVANCE_FROM: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "ASSESSMENT",
];

export function shouldAdvanceToInterview(status: ApplicationStatus) {
  return INTERVIEW_ADVANCE_FROM.includes(status);
}

export function applicationReachedInterview(input: {
  status: ApplicationStatus;
  hasInterview: boolean;
  historyStatuses?: ApplicationStatus[];
}) {
  if (input.hasInterview || input.status === "INTERVIEW" || input.status === "OFFER") {
    return true;
  }
  return (input.historyStatuses ?? []).some(
    (status) => status === "INTERVIEW" || status === "OFFER",
  );
}

export function applicationReachedOffer(input: {
  status: ApplicationStatus;
  historyStatuses?: ApplicationStatus[];
}) {
  return (
    input.status === "OFFER" || (input.historyStatuses ?? []).includes("OFFER")
  );
}

export type SourceSummaryRow = {
  source: string;
  applications: number;
  interviews: number;
  offers: number;
  interviewRate: number | null;
};

export function summarizeSources(
  rows: Array<{
    source: string | null;
    status: ApplicationStatus;
    hasInterview: boolean;
    historyStatuses?: ApplicationStatus[];
  }>,
): SourceSummaryRow[] {
  const totals = new Map<
    string,
    { source: string; applications: number; interviews: number; offers: number }
  >();

  for (const row of rows) {
    const source = row.source?.trim() ? row.source : "Unspecified";
    const current = totals.get(source) ?? {
      source,
      applications: 0,
      interviews: 0,
      offers: 0,
    };
    current.applications += 1;
    if (applicationReachedInterview(row)) {
      current.interviews += 1;
    }
    if (applicationReachedOffer(row)) {
      current.offers += 1;
    }
    totals.set(source, current);
  }

  return [...totals.values()]
    .map((row) => ({
      ...row,
      interviewRate: conversionRate(row.interviews, row.applications),
    }))
    .sort(
      (left, right) =>
        right.interviews - left.interviews || right.applications - left.applications,
    );
}

export type AnalyticsApplicationRow = {
  id: string;
  status: ApplicationStatus;
  source: string | null;
  hasInterview: boolean;
  history: Array<{ toStatus: ApplicationStatus; changedAt: Date }>;
};

export type JobSearchAnalytics = {
  range: AnalyticsRange;
  applications: number;
  submitted: number;
  interviews: number;
  offers: number;
  applicationToInterview: number | null;
  interviewToOffer: number | null;
  byStatus: Array<{ status: ApplicationStatus; count: number }>;
  bySource: SourceSummaryRow[];
  timeInStage: StageDurationRow[];
};

export function buildJobSearchAnalytics(
  rows: AnalyticsApplicationRow[],
  range: AnalyticsRange,
  now = new Date(),
): JobSearchAnalytics {
  const byStatusCounts = new Map<ApplicationStatus, number>();
  let submitted = 0;
  let interviews = 0;
  let offers = 0;

  for (const row of rows) {
    byStatusCounts.set(row.status, (byStatusCounts.get(row.status) ?? 0) + 1);
    const historyStatuses = row.history.map((entry) => entry.toStatus);
    const reachedInterview = applicationReachedInterview({
      status: row.status,
      hasInterview: row.hasInterview,
      historyStatuses,
    });
    if (row.status !== "SAVED" || reachedInterview) {
      submitted += 1;
    }
    if (reachedInterview) {
      interviews += 1;
    }
    if (applicationReachedOffer({ status: row.status, historyStatuses })) {
      offers += 1;
    }
  }

  const history = rows.flatMap((row) =>
    row.history.map((entry) => ({
      applicationId: row.id,
      toStatus: entry.toStatus,
      changedAt: entry.changedAt,
    })),
  );

  return {
    range,
    applications: rows.length,
    submitted,
    interviews,
    offers,
    applicationToInterview: conversionRate(interviews, submitted),
    interviewToOffer: conversionRate(offers, interviews),
    byStatus: APPLICATION_STATUSES.map((status) => ({
      status,
      count: byStatusCounts.get(status) ?? 0,
    })),
    bySource: summarizeSources(
      rows.map((row) => ({
        source: row.source,
        status: row.status,
        hasInterview: row.hasInterview,
        historyStatuses: row.history.map((entry) => entry.toStatus),
      })),
    ),
    timeInStage: averageStageDurationDays(history, now),
  };
}
