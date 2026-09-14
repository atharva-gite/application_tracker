import Link from "next/link";

import { InterviewUpdateForm } from "@/components/applications/workspace-forms";
import { InterviewNotFound } from "@/components/interviews/interview-not-found";
import { JoinInterviewLink } from "@/components/interviews/join-interview-link";
import { InterviewStatusBadge } from "@/components/status-badge";
import { AppError } from "@/lib/errors";
import {
  interviewOutcomeLabel,
  interviewStatusLabel,
  interviewTypeLabel,
  interviewWhenLabel,
  isActiveInterview,
} from "@/lib/interviews";
import { requireUser } from "@/server/authorization/require-user";
import { getInterview } from "@/server/services/interview-service";
import { listApplicationNotes } from "@/server/services/note-service";

export const metadata = { title: "Interview" };

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  let interview;
  try {
    interview = await getInterview(user.id, id);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      return <InterviewNotFound />;
    }
    throw error;
  }

  const company = interview.application?.company.name ?? "Company";
  const role = interview.application?.roleTitle ?? "Role";
  const applicationId = interview.applicationId;
  const active = isActiveInterview(interview);
  const when = interviewWhenLabel(interview);
  const outcome = interviewOutcomeLabel(interview.outcome);
  const notes = await listApplicationNotes(user.id, applicationId);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/interviews" className="text-sm text-stone-600 hover:text-stone-900">
        ← Interviews
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{company}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{role}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-600">
            <span>{interviewTypeLabel(interview.type)}</span>
            <InterviewStatusBadge status={interview.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {interview.meetingUrl && active ? (
            <JoinInterviewLink href={interview.meetingUrl} variant="button" />
          ) : null}
          <Link href={`/applications/${applicationId}`} className="btn-secondary">
            Open application
          </Link>
        </div>
      </div>

      {active ? (
        <section className="card p-5">
          <h2 className="text-lg font-medium">Prepare</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail
              label="Date and time"
              value={when.label}
              tone={when.overdue ? "danger" : undefined}
            />
            <Detail label="Interviewer" value={interview.interviewerName ?? "Not added yet"} />
            <Detail label="Meeting" value={interview.meetingUrl ? "Ready" : "No meeting link yet"} />
            <Detail label="Status" value={interviewStatusLabel(interview.status)} />
          </dl>
          {interview.meetingUrl ? (
            <div className="mt-4 sm:hidden">
              <JoinInterviewLink href={interview.meetingUrl} />
            </div>
          ) : null}
        </section>
      ) : (
        <section className="card p-5">
          <h2 className="text-lg font-medium">Outcome</h2>
          <p className="mt-3 text-sm text-stone-700">{outcome ?? "Pending"}</p>
          <p className="mt-2 text-sm text-stone-600">
            Continue on the application to update the stage after this interview.
          </p>
          <Link href={`/applications/${applicationId}`} className="btn-primary mt-4">
            Open application
          </Link>
        </section>
      )}

      <section className="card p-5">
        <h2 className="text-lg font-medium">{active ? "Prep notes" : "Notes"}</h2>
        {interview.notes ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">{interview.notes}</p>
        ) : (
          <p className="mt-3 text-sm text-stone-600">
            {active
              ? "Add what you need to prepare. These notes stay with this interview."
              : "Add what happened in this interview."}
          </p>
        )}
      </section>

      {!active ? (
        <section className="card p-5">
          <h2 className="text-sm font-medium text-stone-500">Interview</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="Date and time" value={when.label} />
            <Detail label="Interviewer" value={interview.interviewerName ?? "Not added"} />
            {interview.meetingUrl ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Meeting
                </p>
                <div className="mt-1">
                  <JoinInterviewLink href={interview.meetingUrl} />
                </div>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {notes.notes.length > 0 ? (
        <section className="card p-5">
          <h2 className="text-lg font-medium">Application notes</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {notes.notes.map((note) => (
              <li key={note.id} className="rounded-lg bg-white p-3 ring-1 ring-border">
                <p className="whitespace-pre-wrap text-stone-700">{note.content}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card p-5">
        <h2 className="text-lg font-medium">Update interview</h2>
        <InterviewUpdateForm applicationId={applicationId} interview={interview} />
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-1 text-sm ${tone === "danger" ? "text-[var(--danger)]" : "text-stone-700"}`}>
        {value}
      </p>
    </div>
  );
}
