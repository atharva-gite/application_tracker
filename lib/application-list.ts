import { withQuery } from "@/lib/query-string";
import type { ApplicationListQuery } from "@/lib/validation/application";

export function applicationDetailPath(id: string) {
  return `/applications/${id}`;
}

export function shouldOpenApplicationRow(key: string) {
  return key === "Enter" || key === " ";
}

export function resolveLastActivityAt(input: {
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: Array<{ changedAt: Date }>;
  notes?: Array<{ createdAt: Date; updatedAt: Date }>;
  interviews?: Array<{ createdAt?: Date; updatedAt: Date }>;
  followUps?: Array<{ createdAt: Date; completedAt: Date | null }>;
}) {
  const stamps = [input.createdAt, input.updatedAt];
  for (const entry of input.statusHistory ?? []) {
    stamps.push(entry.changedAt);
  }
  for (const note of input.notes ?? []) {
    stamps.push(note.createdAt, note.updatedAt);
  }
  for (const interview of input.interviews ?? []) {
    stamps.push(interview.updatedAt);
    if (interview.createdAt) {
      stamps.push(interview.createdAt);
    }
  }
  for (const followUp of input.followUps ?? []) {
    stamps.push(followUp.createdAt);
    if (followUp.completedAt) {
      stamps.push(followUp.completedAt);
    }
  }
  return stamps.reduce((latest, stamp) =>
    stamp.getTime() > latest.getTime() ? stamp : latest,
  );
}

export function applicationFilterQuery(
  query: ApplicationListQuery,
  view: "list" | "board" = query.view === "board" ? "board" : "list",
) {
  return {
    q: query.q,
    status: query.status,
    companyId: query.companyId,
    location: query.location,
    source: query.source,
    due: query.due,
    deadlineFrom: query.deadlineFrom,
    deadlineTo: query.deadlineTo,
    appliedFrom: query.appliedFrom,
    appliedTo: query.appliedTo,
    sort: query.sort,
    order: query.order,
    view,
    archived: query.archived,
  };
}

export function hasActiveApplicationFilters(query: {
  q?: string;
  status?: string;
  companyId?: string;
  location?: string;
  source?: string;
  due?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  appliedFrom?: string;
  appliedTo?: string;
  archived?: string;
}) {
  return Boolean(
    query.q ||
      query.status ||
      query.companyId ||
      query.location ||
      query.source ||
      query.due ||
      query.deadlineFrom ||
      query.deadlineTo ||
      query.appliedFrom ||
      query.appliedTo ||
      (query.archived && query.archived !== "false"),
  );
}

export function resetApplicationsHref(view: "list" | "board" = "list") {
  return withQuery("/applications", { view: view === "board" ? "board" : undefined });
}

export function defaultSortOrder(sort: string | undefined): "asc" | "desc" {
  if (sort === "company" || sort === "roleTitle" || sort === "deadline") {
    return "asc";
  }
  return "desc";
}

export function sortHeaderQuery(
  query: Record<string, string | number | undefined | null>,
  field: string,
) {
  const active = query.sort === field || (field === "lastActivity" && query.sort === "updatedAt");
  const order =
    active && query.order === "asc"
      ? "desc"
      : active && query.order === "desc"
        ? "asc"
        : defaultSortOrder(field);
  return {
    ...query,
    sort: field,
    order,
    page: 1,
  };
}
