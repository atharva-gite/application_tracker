import { describeWhen } from "@/lib/attention";
import {
  interviewOutcomeLabels,
  interviewStatusLabels,
  interviewTypeLabels,
} from "@/lib/labels";
import type { INTERVIEW_OUTCOMES, INTERVIEW_STATUSES, INTERVIEW_TYPES } from "@/lib/validation/interview";

export const INTERVIEW_GROUP_ORDER = ["today", "tomorrow", "upcoming", "past"] as const;

export type InterviewGroupKey = (typeof INTERVIEW_GROUP_ORDER)[number];

export const interviewGroupTitles: Record<InterviewGroupKey, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  upcoming: "Upcoming",
  past: "Past",
};

type InterviewLike = {
  scheduledAt: string | null;
  status: string;
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function interviewHref(id: string) {
  return `/interviews/${id}`;
}

export function interviewGroupKey(interview: InterviewLike, now = new Date()): InterviewGroupKey {
  if (interview.status === "COMPLETED" || interview.status === "CANCELLED") {
    return "past";
  }
  if (!interview.scheduledAt) {
    return "upcoming";
  }
  const date = new Date(interview.scheduledAt);
  const dayDiff = Math.round((startOfLocalDay(date) - startOfLocalDay(now)) / 86_400_000);
  if (dayDiff < 0) {
    return "past";
  }
  if (dayDiff === 0) {
    return "today";
  }
  if (dayDiff === 1) {
    return "tomorrow";
  }
  return "upcoming";
}

export function groupInterviews<T extends InterviewLike>(interviews: T[], now = new Date()) {
  const groups: Record<InterviewGroupKey, T[]> = {
    today: [],
    tomorrow: [],
    upcoming: [],
    past: [],
  };

  for (const interview of interviews) {
    groups[interviewGroupKey(interview, now)].push(interview);
  }

  for (const key of INTERVIEW_GROUP_ORDER) {
    groups[key].sort((a, b) => {
      const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
      return key === "past" ? bTime - aTime : aTime - bTime;
    });
  }

  return groups;
}

export function isActiveInterview(interview: InterviewLike, now = new Date()) {
  return interviewGroupKey(interview, now) !== "past";
}

export function interviewTypeLabel(type: string) {
  return type in interviewTypeLabels
    ? interviewTypeLabels[type as (typeof INTERVIEW_TYPES)[number]]
    : type;
}

export function interviewStatusLabel(status: string) {
  return status in interviewStatusLabels
    ? interviewStatusLabels[status as (typeof INTERVIEW_STATUSES)[number]]
    : status;
}

export function interviewOutcomeLabel(outcome: string | null | undefined) {
  if (!outcome) {
    return null;
  }
  return outcome in interviewOutcomeLabels
    ? interviewOutcomeLabels[outcome as (typeof INTERVIEW_OUTCOMES)[number]]
    : outcome;
}

export function interviewWhenLabel(
  interview: InterviewLike,
  now = new Date(),
) {
  if (!interview.scheduledAt) {
    return { overdue: false, label: "Time not set" };
  }
  const when = describeWhen(interview.scheduledAt, now);
  if (when.overdue && interview.status === "SCHEDULED") {
    return { overdue: true, label: `Overdue · ${when.label}` };
  }
  return when;
}
