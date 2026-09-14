import Link from "next/link";

import {
  ContactForm,
  FollowUpForm,
  InterviewForm,
  NoteForm,
} from "@/components/applications/workspace-forms";
import { StatusBadge } from "@/components/status-badge";
import {
  employmentLabels,
  followUpTypeLabels,
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
import { DocumentAttachForm } from "@/components/applications/document-attach-form";
import { DocumentRow } from "@/components/documents/document-row";
import { loadOrNotFound } from "@/lib/load-or-not-found";

export const metadata = { title: "Application" };

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [
    application,
    history,
    interviews,
    notes,
    followUps,
    contacts,
    documents,
    library,
    companies,
  ] = await loadOrNotFound(() =>
    Promise.all([
      getApplication(user.id, id),
      getApplicationHistory(user.id, id),
      listApplicationInterviews(user.id, id),
      listApplicationNotes(user.id, id),
      listApplicationFollowUps(user.id, id),
      listApplicationContacts(user.id, id),
      listApplicationDocuments(user.id, id),
      listDocuments(user.id, { page: 1, pageSize: 50 }),
      listCompanies(user.id, { page: 1, pageSize: 100 }),
    ]),
  );

    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">{application.company.name}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {application.roleTitle}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-stone-600">
              <StatusBadge status={application.status} />
              {application.location ? <span>{application.location}</span> : null}
              {application.employmentType ? (
                <span>{employmentLabels[application.employmentType]}</span>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/applications/${id}/edit`} className="btn-secondary">
              Edit
            </Link>
            <form action={archiveApplicationAction}>
              <input type="hidden" name="applicationId" value={id} />
              <button className="btn-ghost text-[var(--danger)]">Archive</button>
            </form>
          </div>
        </div>

        <section className="card p-5">
          <h2 className="mb-3 text-sm font-medium text-stone-500">Pipeline</h2>
          <div className="flex flex-wrap gap-2">
            {APPLICATION_STATUSES.map((status) => (
              <form action={changeStatusAction} key={status}>
                <input type="hidden" name="applicationId" value={id} />
                <input type="hidden" name="status" value={status} />
                <button
                  className={`rounded-full px-3 py-1 text-sm ${
                    application.status === status
                      ? "bg-stone-900 text-white"
                      : "bg-white ring-1 ring-border"
                  }`}
                >
                  {statusLabels[status]}
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <Info label="Job URL" value={application.jobUrl} href={application.jobUrl} />
          <Info label="Source" value={application.source} />
          <Info label="Applied" value={application.applicationDate} />
          <Info label="Deadline" value={application.deadline} />
          <Info
            label="Salary"
            value={
              application.salaryMin || application.salaryMax
                ? `${application.salaryMin ?? "?"}–${application.salaryMax ?? "?"} ${application.salaryCurrency ?? ""}`
                : null
            }
          />
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">
              {application.description || "No description yet."}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-medium">Timeline</h2>
          <ol className="mt-4 space-y-3">
            {history.history.map((entry) => (
              <li key={entry.id} className="flex gap-3 text-sm">
                <span className="w-40 text-stone-500">
                  {entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ""}
                </span>
                <span>
                  {entry.fromStatus ? `${statusLabels[entry.fromStatus]} → ` : "Created as "}
                  {statusLabels[entry.toStatus]}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Interviews" empty={interviews.interviews.length === 0} emptyText="No interviews scheduled.">
            <ul className="space-y-3 text-sm">
              {interviews.interviews.map((interview) => (
                <li key={interview.id} className="rounded-lg bg-white p-3 ring-1 ring-border">
                  <p className="font-medium">{interviewTypeLabels[interview.type]}</p>
                  <p className="text-stone-600">
                    {interview.scheduledAt
                      ? new Date(interview.scheduledAt).toLocaleString()
                      : ""}
                    {interview.interviewerName ? ` · ${interview.interviewerName}` : ""}
                  </p>
                  {interview.meetingUrl ? (
                    <a
                      href={interview.meetingUrl}
                      className="mt-1 inline-block text-accent hover:underline"
                    >
                      Meeting link
                    </a>
                  ) : null}
                  {interview.notes ? (
                    <p className="mt-2 whitespace-pre-wrap text-stone-700">{interview.notes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            <InterviewForm applicationId={id} />
          </Panel>

          <Panel title="Follow-ups" empty={followUps.followUps.length === 0} emptyText="No follow-ups.">
            <ul className="space-y-3 text-sm">
              {followUps.followUps.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-border">
                  <div>
                    <p className="font-medium">{followUpTypeLabels[item.type]}</p>
                    <p className="text-stone-600">
                      {item.dueAt ? new Date(item.dueAt).toLocaleString() : ""}
                      {item.completedAt ? " · done" : ""}
                    </p>
                  </div>
                  {!item.completedAt ? (
                    <form action={completeFollowUpAction}>
                      <input type="hidden" name="followUpId" value={item.id} />
                      <input type="hidden" name="applicationId" value={id} />
                      <button className="text-sm text-accent">Complete</button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
            <FollowUpForm applicationId={id} />
          </Panel>

          <Panel title="Notes" empty={notes.notes.length === 0} emptyText="No notes yet.">
            <ul className="space-y-3 text-sm">
              {notes.notes.map((note) => (
                <li key={note.id} className="rounded-lg bg-white p-3 ring-1 ring-border">
                  <p className="whitespace-pre-wrap">{note.content}</p>
                  <p className="mt-2 text-xs text-stone-500">
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                  </p>
                </li>
              ))}
            </ul>
            <NoteForm applicationId={id} />
          </Panel>

          <Panel title="Contacts" empty={contacts.contacts.length === 0} emptyText="No contacts linked.">
            <ul className="space-y-3 text-sm">
              {contacts.contacts.map((contact) => (
                <li key={contact.id} className="rounded-lg bg-white p-3 ring-1 ring-border">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-stone-600">
                    {[contact.role, contact.email].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
            <ContactForm applicationId={id} companies={companies.companies} />
          </Panel>
        </div>

        <Panel title="Documents" empty={documents.documents.length === 0} emptyText="No resumes linked.">
          {documents.documents.length > 0 ? (
            <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-border">
              {documents.documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </ul>
          ) : null}
          <DocumentAttachForm applicationId={id} documents={library.documents} />
        </Panel>
      </div>
    );
  }

function Info({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | null;
  href?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      {href && value ? (
        <a href={href} className="mt-1 block truncate text-sm text-accent hover:underline">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm text-stone-700">{value || "—"}</p>
      )}
    </div>
  );
}

function Panel({
  title,
  empty,
  emptyText,
  children,
}: {
  title: string;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-5 p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {empty ? <p className="text-sm text-stone-600">{emptyText}</p> : null}
      {children}
    </section>
  );
}
