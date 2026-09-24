export const ANALYTICS_RANGES = ["7", "30", "90", "all"] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const ANALYTICS_RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7": "7 days",
  "30": "30 days",
  "90": "90 days",
  all: "All time",
};

export function isAnalyticsRange(value: unknown): value is AnalyticsRange {
  return (
    typeof value === "string" &&
    (ANALYTICS_RANGES as readonly string[]).includes(value)
  );
}

/** Inclusive window: last N calendar days in UTC, including today. */
export function analyticsPeriodStart(range: AnalyticsRange, now = new Date()) {
  if (range === "all") {
    return null;
  }
  const days = Number(range);
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - (days - 1),
    ),
  );
}

export function applicationAnchorDate(
  applicationDate: Date | null | undefined,
  createdAt: Date,
) {
  return applicationDate ?? createdAt;
}

export function isApplicationInPeriod(input: {
  applicationDate?: Date | null;
  createdAt: Date;
  range: AnalyticsRange;
  now?: Date;
}) {
  const since = analyticsPeriodStart(input.range, input.now);
  if (!since) {
    return true;
  }
  return applicationAnchorDate(input.applicationDate, input.createdAt) >= since;
}
