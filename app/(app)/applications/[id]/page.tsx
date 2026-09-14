import Link from "next/link";
import type { ReactNode } from "react";

import {
  ContactForm,
  FollowUpForm,
  InterviewForm,
  InterviewUpdateForm,
  NoteEditForm,
  NoteForm,
} from "@/components/applications/workspace-forms";
import { ApplicationNotFound } from "@/components/applications/application-not-found";
import { DocumentAttachForm } from "@/components/applications/document-attach-form";
import { DocumentRow } from "@/components/documents/document-row";
import { JoinInterviewLink } from "@/components/interviews/join-interview-link";
import { StatusBadge } from "@/components/status-badge";
import {
  buildApplicationTimeline,
  describeFollowUpDue,
  documentKindLabel,
  groupTimelineByDay,
  visibleJobFields,
} from "@/lib/application-detail";
import { interviewHref } from "@/lib/interviews";
import { buildAttentionItems, describeWhen } from "@/lib/attention";
import { AppError } from "@/lib/errors";
import {
  followUpTypeLabels,
  interviewOutcomeLabels,
  interviewStatusLabels,
  interviewTypeLabels,
  statusLabels,
} from "@/lib/labels";
import { APPLICATION_STATUSES } from "@/lib/validation/application";
import {
  archiveApplicationAction,
  changeStatusAction,
} from "@/server/actions/applications";
import { completeFollowUpAction } from "@/server/actions/workspace";
import { requireUser } from "@/server/authorization/require-user";
import {
  getApplication,
  getApplicationHistory,
} from "@/server/services/application-service";
import { listApplicationContacts } from "@/server/services/contact-service";
import { listCompanies } from "@/server/services/company-service";
import {
  listApplicationDocuments,
  listDocuments,
} from "@/server/services/document-service";
import { listApplicationFollowUps } from "@/server/services/follow-up-service";
import { listApplicationInterviews } from "@/server/services/interview-service";
import { listApplicationNotes } from "@/server/services/note-service";

export const metadata = { title: "Application" };

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  let application;
  let history;
  let interviews;
  let notes;
  let followUps;
  let contacts;
  let documents;
  let library;
  let companies;

  try {
    [
      application,
      history,
      interviews,
      notes,
      followUps,
      contacts,
      documents,
      library,
      companies,
    ] = await Promise.all([
      getApplication(user.id, id),
      getApplicationHistory(user.id, id),
      listApplicationInterviews(user.id, id),
      listApplicationNotes(user.id, id),
      listApplicationFollowUps(user.id, id),
      listApplicationContacts(user.id, id),
      listApplicationDocuments(user.id, id),
      listDocuments(user.id, { page: 1, pageSize: 50 }),
      listCompanies(user.id, { page: 1, pageSize: 100 }),
    ]);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      return <ApplicationNotFound />;
    }
    throw error;
  }

  const attention = buildAttentionItems({
    interviews: interviews.interviews.map((item) => ({
      id: item.id,
      applicationId: id,
      scheduledAt: item.scheduledAt,
      company: application.company.name,
    })),
    deadlines: application.deadline
      ? [
          {
            id,
            roleTitle: application.roleTitle,
            company: application.company.name,
            deadline: application.deadline,
          },
        ]
      : [],
    followUps: followUps.followUps.map((item) => ({
      id: item.id,
      applicationId: id,
      dueAt: item.dueAt,
      completedAt: item.completedAt,
      company: application.company.name,
      typeLabel: followUpTypeLabels[item.type],
    })),
  });
  const next = attention[0];
  const hasInterviews = interviews.interviews.length > 0;
  const needsInterviewStage =
    hasInterviews &&
    (application.status === "SAVED" ||
      application.status === "APPLIED" ||
      application.status === "ASSESSMENT");
  const closedWithInterview =
    hasInterviews &&
    (application.status === "REJECTED" || application.status === "WITHDRAWN") &&
    interviews.interviews.some((item) => item.status === "SCHEDULED");
  const jobFields = visibleJobFields(application);
  const timeline = groupTimelineByDay(
    buildApplicationTimeline({
      history: history.history,
      interviews: interviews.interviews,
      followUps: followUps.followUps,
    }),
  );
  const sortedFollowUps = [...followUps.followUps].sort((a, b) => {
    const aDue = describeFollowUpDue(a.dueAt, a.completedAt);
    const bDue = describeFollowUpDue(b.dueAt, b.completedAt);
    const rank = { overdue: 0, due_today: 1, upcoming: 2, completed: 3 };
    if (rank[aDue.kind] !== rank[bDue.kind]) {
      return rank[aDue.kind] - rank[bDue.kind];
    }
    return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/applications" className="text-sm text-stone-600 hover:text-stone-900">
        ← Applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">
            <Link href={`/companies/${application.company.id}`} className="hover:underline">
              {application.company.name}
            </Link>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {application.roleTitle}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-600">
            <StatusBadge status={application.status} />
            {application.archivedAt ? <span>Archived</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {application.jobUrl ? (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Job posting
            </a>
          ) : null}
          <Link href={`/applications/${id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <form action={archiveApplicationAction}>
            <input type="hidden" name="applicationId" value={id} />
            <button className="btn-ghost text-[var(--danger)]">Archive</button>
          </form>
        </div>
      </div>

      {next ? (
        <p className="text-sm text-stone-600">
          Next:{" "}
          <Link
            href={next.href}
            className={next.relative.overdue ? "text-[var(--danger)] hover:underline" : "font-medium hover:underline"}
          >
            {next.title}
          </Link>
          {" · "}
          {next.relative.overdue ? `Overdue · ${next.relative.label}` : next.relative.label}
        </p>
      ) : null}

      {needsInterviewStage ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-border">
          <p className="text-sm text-stone-700">
            This application has an interview but is still in {statusLabels[application.status]}.
          </p>
          <form action={changeStatusAction}>
            <input type="hidden" name="applicationId" value={id} />
            <input type="hidden" name="status" value="INTERVIEW" />
            <button className="text-sm font-medium text-accent">Move to Interview</button>
          </form>
        </div>
      ) : null}

      {closedWithInterview ? (
        <p className="text-sm text-stone-600">
          There is still a scheduled interview on a {statusLabels[application.status].toLowerCase()}{" "}
          application.
        </p>
      ) : null}

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-medium text-stone-500">Stage</h2>
        <div className="flex flex-wrap gap-2">
          {APPLICATION_STATUSES.map((status) => (
            <form action={changeStatusAction} key={status}>
              <input type="hidden" name="applicationId" value={id} />
              <input type="hidden" name="status" value={status} />
              <button
                className={`rounded-full px-3 py-1 text-sm ${
                  application.status === status
                    ? "bg-accent text-white"
                    : "bg-white ring-1 ring-border"
                }`}
              >
                {statusLabels[status]}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-medium">Job information</h2>
        {jobFields.length === 0 && !application.description ? (
          <p className="mt-3 text-sm text-stone-600">No additional job details yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {jobFields.map((field) => (
              <div key={field.label} className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  {field.label}
                </p>
                {field.href ? (
                  <a
                    href={field.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block truncate text-sm text-accent hover:underline"
                  >
                    {field.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-stone-700">{field.value}</p>
                )}
              </div>
            ))}
            {application.description ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">
                  {application.description}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-medium">Timeline</h2>
        {timeline.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No history recorded yet.</p>
        ) : (
          <ol className="mt-4 space-y-5">
            {timeline.map((group) => (
              <li key={group.dateLabel}>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  {group.dateLabel}
                </p>
                <ul className="mt-2 space-y-2 text-sm text-stone-700">
                  {group.events.map((event) => (
                    <li key={event.id}>{event.title}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Interviews"
          empty={interviews.interviews.length === 0}
          emptyTitle="No interviews scheduled"
          emptyText="Add an interview when you have one."
        >
          {interviews.interviews.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {interviews.interviews.map((interview) => {
                const when = interview.scheduledAt ? describeWhen(interview.scheduledAt) : null;
                return (
                  <li key={interview.id} className="rounded-lg bg-white p-3 ring-1 ring-border">
                    <Link href={interviewHref(interview.id)} className="font-medium hover:underline">
                      {interviewTypeLabels[interview.type]}
                    </Link>
                    <p className={when?.overdue ? "text-[var(--danger)]" : "text-stone-600"}>
                      {when ? `${when.overdue ? "Overdue · " : ""}${when.label}` : ""}
                      {interview.interviewerName ? ` · ${interview.interviewerName}` : ""}
                      {` · ${interviewStatusLabels[interview.status]}`}
                      {interview.outcome
                        ? ` · ${interviewOutcomeLabels[interview.outcome]}`
                        : ""}
                    </p>
                    {interview.meetingUrl ? (
                      <div className="mt-1">
                        <JoinInterviewLink href={interview.meetingUrl} />
                      </div>
                    ) : null}
                    {interview.notes ? (
                      <p className="mt-2 whitespace-pre-wrap text-stone-700">{interview.notes}</p>
                    ) : null}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-stone-700">
                        View / edit
                      </summary>
                      <InterviewUpdateForm applicationId={id} interview={interview} />
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <InterviewForm applicationId={id} />
        </Panel>

        <Panel
          title="Contacts"
          empty={contacts.contacts.length === 0}
          emptyTitle="No contacts linked"
          emptyText="Add a recruiter or interviewer when you have one."
        >
          {contacts.contacts.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {contacts.contacts.map((contact) => (
                <li key={contact.id} className="rounded-lg bg-white p-3 ring-1 ring-border">
                  <p className="font-medium">{contact.name}</p>
                  {contact.role ? <p className="text-stone-600">{contact.role}</p> : null}
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="mt-1 block text-accent hover:underline">
                      {contact.email}
                    </a>
                  ) : null}
                  {contact.linkedinUrl ? (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-accent hover:underline"
                    >
                      LinkedIn
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          <ContactForm applicationId={id} companies={companies.companies} />
        </Panel>

        <Panel
          title="Documents"
          empty={documents.documents.length === 0}
          emptyTitle="No resume attached"
          emptyText="Attach a resume"
        >
          {documents.documents.length > 0 ? (
            <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-border">
              {documents.documents.map((doc) => {
                const kind = documentKindLabel(doc);
                return (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    caption={`${kind.type}${kind.format ? ` · ${kind.format}` : ""} · Used for this application`}
                  />
                );
              })}
            </ul>
          ) : null}
          <DocumentAttachForm applicationId={id} documents={library.documents} />
        </Panel>

        <Panel
          title="Follow-ups"
          empty={followUps.followUps.length === 0}
          emptyTitle="No follow-ups"
          emptyText="Add one when you need to check in."
        >
          {sortedFollowUps.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {sortedFollowUps.map((item) => {
                const due = describeFollowUpDue(item.dueAt, item.completedAt);
                const tone =
                  due.kind === "overdue"
                    ? "text-[var(--danger)]"
                    : due.kind === "completed"
                      ? "text-stone-500"
                      : due.kind === "due_today"
                        ? "font-medium text-stone-800"
                        : "text-stone-600";
                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-border"
                  >
                    <div>
                      <p className="font-medium">{followUpTypeLabels[item.type]}</p>
                      <p className={tone}>{due.label}</p>
                      {item.note ? (
                        <p className="mt-2 whitespace-pre-wrap text-stone-700">{item.note}</p>
                      ) : null}
                    </div>
                    {!item.completedAt ? (
                      <form action={completeFollowUpAction}>
                        <input type="hidden" name="followUpId" value={item.id} />
                        <input type="hidden" name="applicationId" value={id} />
                        <button className="text-sm text-accent">Complete</button>
                      </form>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
          <FollowUpForm applicationId={id} />
        </Panel>
      </div>

      <Panel
        title="Notes"
        empty={notes.notes.length === 0}
        emptyTitle="No notes yet"
        emptyText="Add a short note when something is worth remembering."
      >
        {notes.notes.length > 0 ? (
          <ul className="space-y-3 text-sm">
            {notes.notes.map((note) => (
              <li key={note.id} className="rounded-lg bg-white p-3 ring-1 ring-border">
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="mt-2 text-xs text-stone-500">
                  {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-stone-700">
                    Edit
                  </summary>
                  <NoteEditForm applicationId={id} note={note} />
                </details>
              </li>
            ))}
          </ul>
        ) : null}
        <NoteForm applicationId={id} />
      </Panel>
    </div>
  );
}

function Panel({
  title,
  empty,
  emptyTitle,
  emptyText,
  children,
}: {
  title: string;
  empty: boolean;
  emptyTitle: string;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <section className="card space-y-5 p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {empty ? (
        <div>
          <p className="text-sm text-stone-700">{emptyTitle}</p>
          <p className="mt-1 text-sm text-stone-500">{emptyText}</p>
        </div>
      ) : null}
      {children}
    </section>
  );
}
