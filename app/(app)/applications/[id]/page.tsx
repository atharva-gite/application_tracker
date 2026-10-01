import Link from "next/link";
import type { ReactNode } from "react";

import {
  ContactForm,
  FollowUpForm,
  FollowUpUpdateForm,
  InterviewForm,
  InterviewUpdateForm,
  NoteEditForm,
  NoteForm,
} from "@/components/applications/workspace-forms";
import { CompleteFollowUpButton } from "@/components/applications/complete-follow-up-button";
import { ApplicationNotFound } from "@/components/applications/application-not-found";
import { ApplicationResumePanel } from "@/components/applications/application-resume-panel";
import { StatusChangeForm } from "@/components/applications/status-change-form";
import { DocumentAttachForm } from "@/components/applications/document-attach-form";
import { DocumentRow } from "@/components/documents/document-row";
import { JoinInterviewLink } from "@/components/interviews/join-interview-link";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmForm } from "@/components/ui/confirm-form";
import {
  buildApplicationTimeline,
  documentKindLabel,
  groupFollowUpsByDue,
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
  unarchiveApplicationAction,
} from "@/server/actions/applications";
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
import { getCurrentUser } from "@/server/services/auth-service";
import { listApplicationFollowUps } from "@/server/services/follow-up-service";
import { listApplicationInterviews } from "@/server/services/interview-service";
import { listApplicationNotes } from "@/server/services/note-service";

export const metadata = { title: "Application" };

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessionUser = await requireUser();
  const user = await getCurrentUser(sessionUser.id);
  const timeZone = user.timezone;
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

  const attention = buildAttentionItems(
    {
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
    },
    new Date(),
    timeZone,
  );
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
  const followUpGroups = groupFollowUpsByDue(followUps.followUps, new Date(), timeZone);
  const resume = documents.resume;
  const otherDocuments = documents.documents.filter((doc) => doc.id !== resume?.id);
  const resumeLibrary = library.documents.filter((doc) => doc.type === "RESUME");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link href="/applications" className="text-sm text-stone-600 hover:text-stone-900">
          ← Applications
        </Link>
        <div className="mt-4">
          <PageHeader
            kicker={
              <Link href={`/companies/${application.company.id}`} className="hover:underline">
                {application.company.name}
              </Link>
            }
            title={application.roleTitle}
            description={application.archivedAt ? "Archived" : undefined}
            actions={
              <>
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
          {application.archivedAt ? (
            <form action={unarchiveApplicationAction}>
              <input type="hidden" name="applicationId" value={id} />
              <button className="btn-ghost">Unarchive</button>
            </form>
          ) : (
            <ConfirmForm
              action={archiveApplicationAction}
              message="Archive this application? It will leave your active pipeline."
            >
              <input type="hidden" name="applicationId" value={id} />
              <button className="btn-ghost text-[var(--danger)]">Archive</button>
            </ConfirmForm>
          )}
              </>
            }
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {APPLICATION_STATUSES.map((status) => (
            <StatusChangeForm applicationId={id} status={status} key={status}>
              <button
                className={
                  application.status === status
                    ? "rounded-full bg-accent px-3 py-1 text-sm text-white"
                    : "chip"
                }
              >
                {statusLabels[status]}
              </button>
            </StatusChangeForm>
          ))}
        </div>
      </div>

      {next ? (
        <p className="border-l-[3px] border-accent pl-3 text-sm leading-6 text-stone-700">
          Next:{" "}
          <Link
            href={next.href}
            className={next.relative.overdue ? "text-[var(--danger)] hover:underline" : "font-medium text-foreground hover:underline"}
          >
            {next.title}
          </Link>
          <span className={next.relative.overdue ? "text-[var(--danger)]" : "text-stone-500"}>
            {" · "}
            {next.relative.overdue ? `Overdue · ${next.relative.label}` : next.relative.label}
          </span>
        </p>
      ) : null}

      {needsInterviewStage ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-l-[3px] border-accent pl-3">
          <p className="text-sm text-stone-700">
            This application has an interview but is still in {statusLabels[application.status]}.
          </p>
          <StatusChangeForm applicationId={id} status="INTERVIEW">
            <button className="text-sm font-medium text-accent">Move to Interview</button>
          </StatusChangeForm>
        </div>
      ) : null}

      {closedWithInterview ? (
        <p className="text-sm text-stone-600">
          There is still a scheduled interview on a {statusLabels[application.status].toLowerCase()}{" "}
          application.
        </p>
      ) : null}

      <section className="border-t border-border pt-6">
        <h2 className="text-sm font-medium text-stone-500">Job information</h2>
        {jobFields.length === 0 && !application.description ? (
          <p className="mt-3 text-sm text-stone-600">No additional job details yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {jobFields.map((field) => (
              <div key={field.label} className="min-w-0">
                <p className="text-[0.8125rem] text-stone-500">{field.label}</p>
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
                <p className="text-[0.8125rem] text-stone-500">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">
                  {application.description}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="border-t border-border pt-6">
        <details className="group" open={!next}>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-stone-500">
            <span className="inline-block text-base text-stone-400 transition group-open:rotate-90">
              ›
            </span>
            Timeline
          </summary>
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
        </details>
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
                const when = interview.scheduledAt
                  ? describeWhen(interview.scheduledAt, new Date(), timeZone)
                  : null;
                return (
                  <li key={interview.id} className="border-t border-border py-3.5 first:border-0 first:pt-0">
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
                    <details className="group mt-3">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-stone-600 hover:text-foreground">
                        <span className="inline-block text-stone-400 transition group-open:rotate-90">
                          ›
                        </span>
                        View / edit
                      </summary>
                      <InterviewUpdateForm applicationId={id} interview={interview} />
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <AddSection label="Add interview">
            <InterviewForm applicationId={id} />
          </AddSection>
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
                <li key={contact.id} className="border-t border-border py-3.5 text-sm first:border-0 first:pt-0">
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
          <AddSection label="Add contact">
            <ContactForm applicationId={id} companies={companies.companies} />
          </AddSection>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationResumePanel
          applicationId={id}
          resume={resume}
          format={resume ? documentKindLabel(resume).format : null}
          library={resumeLibrary}
        />

        <Panel
          title="Other documents"
          empty={otherDocuments.length === 0}
          emptyTitle="No other documents"
          emptyText="Attach a cover letter or supporting file if you have one."
        >
          {otherDocuments.length > 0 ? (
            <ul className="divide-y divide-border border-y border-border">
              {otherDocuments.map((doc) => {
                const kind = documentKindLabel(doc);
                return (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    caption={`${kind.type}${kind.format ? ` · ${kind.format}` : ""}`}
                  />
                );
              })}
            </ul>
          ) : null}
          <AddSection label="Attach document">
            <DocumentAttachForm applicationId={id} documents={library.documents} />
          </AddSection>
        </Panel>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel
          title="Follow-ups"
          empty={followUps.followUps.length === 0}
          emptyTitle="No follow-ups"
          emptyText="Add a recruiter check-in, thank-you, or status check when you have a next step."
        >
          {followUpGroups.length > 0 ? (
            <div className="space-y-5 text-sm">
              {followUpGroups.map((group) => (
                <div key={group.kind}>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {group.label}
                  </h3>
                  <ul className="mt-2 space-y-3">
                    {group.items.map((item) => {
                      const tone =
                        item.due.kind === "overdue"
                          ? "text-[var(--danger)]"
                          : item.due.kind === "due_today"
                            ? "font-medium text-stone-800"
                            : "text-stone-600";
                      return (
                        <li
                          key={item.id}
                          className={`border-t border-border py-3.5 first:border-0 first:pt-0 ${
                            item.due.kind === "completed" ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p
                                className={
                                  item.due.kind === "completed"
                                    ? "font-medium text-stone-500"
                                    : "font-medium"
                                }
                              >
                                {followUpTypeLabels[item.type]}
                              </p>
                              <p className={item.due.kind === "completed" ? "text-stone-500" : tone}>
                                {item.due.label}
                              </p>
                              {item.note ? (
                                <p
                                  className={`mt-2 whitespace-pre-wrap ${
                                    item.due.kind === "completed"
                                      ? "text-stone-500"
                                      : "text-stone-700"
                                  }`}
                                >
                                  {item.note}
                                </p>
                              ) : null}
                            </div>
                            {item.due.kind !== "completed" ? (
                              <CompleteFollowUpButton followUpId={item.id} applicationId={id} />
                            ) : null}
                          </div>
                          {item.due.kind !== "completed" ? (
                            <details className="group mt-3">
                              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-stone-600 hover:text-foreground">
                                <span className="inline-block text-stone-400 transition group-open:rotate-90">
                                  ›
                                </span>
                                Edit
                              </summary>
                              <FollowUpUpdateForm applicationId={id} followUp={item} />
                            </details>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
          <AddSection label="Add follow-up">
            <FollowUpForm applicationId={id} />
          </AddSection>
        </Panel>

        <Panel
          title="Notes"
          empty={notes.notes.length === 0}
          emptyTitle="No notes yet"
          emptyText="Add a short note when something is worth remembering."
        >
          {notes.notes.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {notes.notes.map((note) => (
                <li key={note.id} className="border-t border-border py-3.5 first:border-0 first:pt-0">
                  <p className="whitespace-pre-wrap">{note.content}</p>
                  <p className="mt-2 text-xs text-stone-500">
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                  </p>
                  <details className="group mt-2">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-stone-600 hover:text-foreground">
                      <span className="inline-block text-stone-400 transition group-open:rotate-90">
                        ›
                      </span>
                      Edit
                    </summary>
                    <NoteEditForm applicationId={id} note={note} />
                  </details>
                </li>
              ))}
            </ul>
          ) : null}
          <AddSection label="Add note">
            <NoteForm applicationId={id} />
          </AddSection>
        </Panel>
      </div>
    </div>
  );
}

function AddSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-stone-600 hover:text-foreground">
        <span className="inline-block text-stone-400 transition group-open:rotate-90">›</span>
        {label}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
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
    <section className="space-y-4 border-t border-border pt-6">
      <h2 className="text-sm font-medium text-stone-500">{title}</h2>
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
