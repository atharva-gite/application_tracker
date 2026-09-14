export type AttentionKind = "interview" | "deadline" | "follow_up";

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

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function parseWhen(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  return new Date(value);
}

function formatDay(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function describeWhen(value: string, now = new Date()): RelativeWhen {
  const date = parseWhen(value);
  const at = date.getTime();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const today = startOfLocalDay(now);
  const day = startOfLocalDay(date);
  const dayDiff = Math.round((day - today) / 86_400_000);
  const overdue = dateOnly ? day < today : at < now.getTime();

  if (overdue) {
    if (dayDiff === -1) {
      return { overdue: true, label: "Yesterday", at };
    }
    return { overdue: true, label: formatDay(date), at };
  }
  if (dayDiff === 0) {
    return {
      overdue: false,
      label: dateOnly ? "Today" : `Today · ${formatTime(date)}`,
      at,
    };
  }
  if (dayDiff === 1) {
    return {
      overdue: false,
      label: dateOnly ? "Tomorrow" : `Tomorrow · ${formatTime(date)}`,
      at,
    };
  }
  if (dayDiff > 1 && dayDiff <= 7) {
    return { overdue: false, label: `In ${dayDiff} days`, at };
  }
  return { overdue: false, label: formatDay(date), at };
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
  },
  now = new Date(),
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const interview of input.interviews) {
    if (!interview.scheduledAt) continue;
    items.push({
      id: `interview-${interview.id}`,
      href: `/applications/${interview.applicationId}`,
      title: `${interview.company} interview`,
      kind: "interview",
      relative: describeWhen(interview.scheduledAt, now),
    });
  }

  for (const deadline of input.deadlines) {
    if (!deadline.deadline) continue;
    items.push({
      id: `deadline-${deadline.id}`,
      href: `/applications/${deadline.id}`,
      title: `${deadline.company} · ${deadline.roleTitle}`,
      kind: "deadline",
      relative: describeWhen(deadline.deadline, now),
    });
  }

  for (const followUp of input.followUps) {
    if (followUp.completedAt || !followUp.dueAt) continue;
    items.push({
      id: `followup-${followUp.id}`,
      href: `/applications/${followUp.applicationId}`,
      title: `${followUp.company} ${followUp.typeLabel.toLowerCase()} follow-up`,
      kind: "follow_up",
      relative: describeWhen(followUp.dueAt, now),
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
