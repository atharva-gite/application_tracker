import {
  calendarDateInZone,
  dayDiffInZone,
  formatZonedDay,
  formatZonedTime,
  systemTimeZone,
} from "@/lib/timezone";

export const STALE_AFTER_DAYS = 14;

const STALE_STATUSES = new Set(["APPLIED", "ASSESSMENT"]);

export type AttentionKind = "interview" | "deadline" | "follow_up" | "stale";

export type RelativeWhen = {
  overdue: boolean;
  label: string;
  at: number;
};

export type AttentionItem = {
  id: string;
  href: string;
  title: string;
  kind: AttentionKind;
  relative: RelativeWhen;
  followUp?: { followUpId: string; applicationId: string };
};

function parseWhen(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  return new Date(value);
}

export function describeWhen(
  value: string,
  now = new Date(),
  timeZone = systemTimeZone(),
): RelativeWhen {
  const date = parseWhen(value);
  const at = date.getTime();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const todayKey = calendarDateInZone(now, timeZone);
  const dayKey = dateOnly ? value : calendarDateInZone(date, timeZone);
  const dayDiff = dayDiffInZone(todayKey, dayKey);
  const overdue = dateOnly ? dayKey < todayKey : at < now.getTime();

  if (overdue) {
    if (dayDiff === -1) {
      return { overdue: true, label: "Yesterday", at };
    }
    return { overdue: true, label: formatZonedDay(date, timeZone), at };
  }
  if (dayDiff === 0) {
    return {
      overdue: false,
      label: dateOnly ? "Today" : `Today · ${formatZonedTime(date, timeZone)}`,
      at,
    };
  }
  if (dayDiff === 1) {
    return {
      overdue: false,
      label: dateOnly ? "Tomorrow" : `Tomorrow · ${formatZonedTime(date, timeZone)}`,
      at,
    };
  }
  if (dayDiff > 1 && dayDiff <= 7) {
    return { overdue: false, label: `In ${dayDiff} days`, at };
  }
  return { overdue: false, label: formatZonedDay(date, timeZone), at };
}

export type DeadlineKind =
  | "overdue"
  | "due_today"
  | "due_tomorrow"
  | "upcoming"
  | "none";

export type DeadlineDisplay = {
  kind: DeadlineKind;
  label: string;
};

export function describeDeadline(
  value: string | null | undefined,
  now = new Date(),
  timeZone = systemTimeZone(),
): DeadlineDisplay {
  if (!value) {
    return { kind: "none", label: "—" };
  }
  const relative = describeWhen(value, now, timeZone);
  if (relative.overdue) {
    return { kind: "overdue", label: relative.label };
  }
  const date = parseWhen(value);
  const dayDiff = dayDiffInZone(
    calendarDateInZone(now, timeZone),
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : calendarDateInZone(date, timeZone),
  );
  if (dayDiff === 0) {
    return { kind: "due_today", label: "Today" };
  }
  if (dayDiff === 1) {
    return { kind: "due_tomorrow", label: "Tomorrow" };
  }
  return { kind: "upcoming", label: relative.label };
}

export function deadlineToneClass(kind: DeadlineKind) {
  switch (kind) {
    case "overdue":
      return "text-[var(--danger)]";
    case "due_today":
      return "font-medium text-stone-800";
    case "due_tomorrow":
      return "text-stone-700";
    case "upcoming":
      return "text-stone-600";
    case "none":
      return "text-stone-400";
  }
}

export function describePast(value: string, now = new Date(), timeZone = systemTimeZone()) {
  const date = parseWhen(value);
  const dayDiff = dayDiffInZone(
    calendarDateInZone(now, timeZone),
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : calendarDateInZone(date, timeZone),
  );

  if (dayDiff === 0) {
    return "Today";
  }
  if (dayDiff === -1) {
    return "Yesterday";
  }
  if (dayDiff < -1 && dayDiff >= -7) {
    return `${-dayDiff} days ago`;
  }
  if (dayDiff > 0) {
    return describeWhen(value, now, timeZone).label;
  }
  return formatZonedDay(date, timeZone);
}

export function isStaleApplication(
  application: {
    status: string;
    archivedAt: string | Date | null;
    lastStatusChangedAt: string | Date | null;
  },
  now = new Date(),
  timeZone = systemTimeZone(),
) {
  if (application.archivedAt) {
    return false;
  }
  if (!STALE_STATUSES.has(application.status)) {
    return false;
  }
  if (!application.lastStatusChangedAt) {
    return false;
  }
  const changedAt =
    application.lastStatusChangedAt instanceof Date
      ? application.lastStatusChangedAt
      : new Date(application.lastStatusChangedAt);
  if (Number.isNaN(changedAt.getTime())) {
    return false;
  }
  return dayDiffInZone(changedAt, now, timeZone) >= STALE_AFTER_DAYS;
}

export function buildAttentionItems(
  input: {
    interviews: Array<{
      id: string;
      applicationId: string;
      scheduledAt: string | null;
      company: string;
    }>;
    deadlines: Array<{
      id: string;
      roleTitle: string;
      company: string;
      deadline: string | null;
    }>;
    followUps: Array<{
      id: string;
      applicationId: string;
      dueAt: string | null;
      completedAt: string | null;
      company: string;
      typeLabel: string;
    }>;
    stale?: Array<{
      id: string;
      company: string;
      roleTitle: string;
      statusLabel: string;
      changedAt: string;
    }>;
  },
  now = new Date(),
  timeZone = systemTimeZone(),
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const interview of input.interviews) {
    if (!interview.scheduledAt) continue;
    items.push({
      id: `interview-${interview.id}`,
      href: `/interviews/${interview.id}`,
      title: `${interview.company} interview`,
      kind: "interview",
      relative: describeWhen(interview.scheduledAt, now, timeZone),
    });
  }

  for (const deadline of input.deadlines) {
    if (!deadline.deadline) continue;
    items.push({
      id: `deadline-${deadline.id}`,
      href: `/applications/${deadline.id}`,
      title: `${deadline.company} · ${deadline.roleTitle}`,
      kind: "deadline",
      relative: describeWhen(deadline.deadline, now, timeZone),
    });
  }

  for (const stale of input.stale ?? []) {
    const changedAt = new Date(stale.changedAt);
    const days = dayDiffInZone(changedAt, now, timeZone);
    items.push({
      id: `stale-${stale.id}`,
      href: `/applications/${stale.id}`,
      title: `${stale.company} · ${stale.roleTitle}`,
      kind: "stale",
      relative: {
        overdue: false,
        label: `${days} days in ${stale.statusLabel}`,
        at: changedAt.getTime(),
      },
    });
  }

  for (const followUp of input.followUps) {
    if (followUp.completedAt || !followUp.dueAt) continue;
    items.push({
      id: `followup-${followUp.id}`,
      href: `/applications/${followUp.applicationId}`,
      title: `${followUp.company} · ${followUp.typeLabel}`,
      kind: "follow_up",
      relative: describeWhen(followUp.dueAt, now, timeZone),
      followUp: {
        followUpId: followUp.id,
        applicationId: followUp.applicationId,
      },
    });
  }

  return items.sort((a, b) => {
    if (a.relative.overdue !== b.relative.overdue) {
      return a.relative.overdue ? -1 : 1;
    }
    return a.relative.at - b.relative.at;
  });
}
