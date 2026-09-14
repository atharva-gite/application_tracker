import { describeWhen, type RelativeWhen } from "@/lib/attention";
import {
  documentTypeLabels,
  employmentLabels,
  followUpTypeLabels,
  interviewTypeLabels,
  statusLabels,
} from "@/lib/labels";
import type { APPLICATION_STATUSES } from "@/lib/validation/application";
import type { DOCUMENT_TYPES } from "@/lib/validation/document";
import type { FOLLOW_UP_TYPES } from "@/lib/validation/follow-up";
import type { INTERVIEW_TYPES } from "@/lib/validation/interview";

type Status = (typeof APPLICATION_STATUSES)[number];

export type JobField = {
  label: string;
  value: string;
  href?: string;
};

export type TimelineEvent = {
  id: string;
  at: string;
  title: string;
};

export type FollowUpDueKind = "overdue" | "due_today" | "upcoming" | "completed";

export type FollowUpDue = {
  kind: FollowUpDueKind;
  label: string;
  relative: RelativeWhen | null;
};

function isStatus(value: unknown): value is Status {
  return typeof value === "string" && value in statusLabels;
}

function parseWhen(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  return new Date(value);
}

function formatDay(value: string) {
  const date = parseWhen(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDisplayDate(value: string) {
  const date = parseWhen(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function describeStatusHistoryEntry(entry: {
  fromStatus: string | null;
  toStatus: string;
}) {
  const to = isStatus(entry.toStatus) ? statusLabels[entry.toStatus] : entry.toStatus;
  if (!entry.fromStatus) {
    if (entry.toStatus === "SAVED") {
      return "Application saved";
    }
    if (entry.toStatus === "APPLIED") {
      return "Application submitted";
    }
    return `Created as ${to}`;
  }
  const from = isStatus(entry.fromStatus)
    ? statusLabels[entry.fromStatus]
    : entry.fromStatus;
  return `Moved from ${from} → ${to}`;
}

export function visibleJobFields(application: {
  applicationDate?: string | null;
  deadline?: string | null;
  location?: string | null;
  employmentType?: string | null;
  source?: string | null;
  jobUrl?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
}): JobField[] {
  const fields: JobField[] = [];

  if (application.applicationDate) {
    fields.push({
      label: "Application date",
      value: formatDisplayDate(application.applicationDate),
    });
  }
  if (application.deadline) {
    fields.push({
      label: "Deadline",
      value: formatDisplayDate(application.deadline),
    });
  }
  if (application.location) {
    fields.push({ label: "Location", value: application.location });
  }
  if (
    application.employmentType &&
    application.employmentType in employmentLabels
  ) {
    fields.push({
      label: "Employment type",
      value: employmentLabels[application.employmentType as keyof typeof employmentLabels],
    });
  }
  if (application.source) {
    fields.push({ label: "Source", value: application.source });
  }
  if (application.jobUrl) {
    fields.push({
      label: "Job URL",
      value: application.jobUrl,
      href: application.jobUrl,
    });
  }
  if (application.salaryMin != null || application.salaryMax != null) {
    const min = application.salaryMin ?? "?";
    const max = application.salaryMax ?? "?";
    const currency = application.salaryCurrency ? ` ${application.salaryCurrency}` : "";
    fields.push({ label: "Salary", value: `${min}–${max}${currency}` });
  }

  return fields;
}

export function buildApplicationTimeline(input: {
  history: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    changedAt: string | null;
  }>;
  interviews: Array<{
    id: string;
    type: string;
    createdAt?: string | null;
    scheduledAt?: string | null;
  }>;
  followUps: Array<{
    id: string;
    type: string;
    createdAt?: string | null;
    completedAt?: string | null;
  }>;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const entry of input.history) {
    if (!entry.changedAt) continue;
    events.push({
      id: `status-${entry.id}`,
      at: entry.changedAt,
      title: describeStatusHistoryEntry(entry),
    });
  }

  for (const interview of input.interviews) {
    const at = interview.createdAt ?? interview.scheduledAt;
    if (!at) continue;
    const type =
      interview.type in interviewTypeLabels
        ? interviewTypeLabels[interview.type as (typeof INTERVIEW_TYPES)[number]]
        : "Interview";
    events.push({
      id: `interview-${interview.id}`,
      at,
      title: `${type} interview scheduled`,
    });
  }

  for (const followUp of input.followUps) {
    const type =
      followUp.type in followUpTypeLabels
        ? followUpTypeLabels[followUp.type as (typeof FOLLOW_UP_TYPES)[number]]
        : "Follow-up";
    if (followUp.createdAt) {
      events.push({
        id: `followup-created-${followUp.id}`,
        at: followUp.createdAt,
        title: `${type} follow-up created`,
      });
    }
    if (followUp.completedAt) {
      events.push({
        id: `followup-completed-${followUp.id}`,
        at: followUp.completedAt,
        title: `${type} follow-up completed`,
      });
    }
  }

  return events.sort((a, b) => parseWhen(b.at).getTime() - parseWhen(a.at).getTime());
}

export function groupTimelineByDay(events: TimelineEvent[]) {
  const groups: Array<{ dateLabel: string; events: TimelineEvent[] }> = [];
  const index = new Map<string, number>();

  for (const event of events) {
    const dateLabel = formatDay(event.at);
    const existing = index.get(dateLabel);
    if (existing === undefined) {
      index.set(dateLabel, groups.length);
      groups.push({ dateLabel, events: [event] });
    } else {
      groups[existing]?.events.push(event);
    }
  }

  return groups;
}

export function describeFollowUpDue(
  dueAt: string | null | undefined,
  completedAt: string | null | undefined,
  now = new Date(),
): FollowUpDue {
  if (completedAt) {
    return { kind: "completed", label: "Completed", relative: null };
  }
  if (!dueAt) {
    return { kind: "upcoming", label: "No due date", relative: null };
  }
  const relative = describeWhen(dueAt, now);
  if (relative.overdue) {
    return { kind: "overdue", label: `Overdue · ${relative.label}`, relative };
  }
  if (relative.label === "Today") {
    return { kind: "due_today", label: "Due today", relative };
  }
  if (relative.label.startsWith("Today · ")) {
    return {
      kind: "due_today",
      label: `Due today · ${relative.label.slice("Today · ".length)}`,
      relative,
    };
  }
  return { kind: "upcoming", label: relative.label, relative };
}

export function documentKindLabel(document: {
  type: string;
  mimeType?: string | null;
  filename?: string | null;
}) {
  const type =
    document.type in documentTypeLabels
      ? documentTypeLabels[document.type as (typeof DOCUMENT_TYPES)[number]]
      : "Document";
  const mime = document.mimeType ?? "";
  const filename = document.filename ?? "";
  if (mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    return { type, format: "PDF" };
  }
  if (
    mime.includes("word") ||
    filename.toLowerCase().endsWith(".doc") ||
    filename.toLowerCase().endsWith(".docx")
  ) {
    return { type, format: "Word" };
  }
  return { type, format: null };
}
