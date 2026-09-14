"use client";

import { useActionState } from "react";

import { Field, SelectField, SubmitButton, TextAreaField } from "@/components/ui/fields";
import {
  followUpTypeLabels,
  interviewOutcomeLabels,
  interviewTypeLabels,
  toDateTimeLocal,
} from "@/lib/labels";
import { FOLLOW_UP_TYPES } from "@/lib/validation/follow-up";
import { INTERVIEW_OUTCOMES, INTERVIEW_TYPES } from "@/lib/validation/interview";
import type { FormState } from "@/server/actions/form-state";
import {
  createFollowUpAction,
  createInterviewAction,
  createLinkedContactAction,
  createNoteAction,
  updateInterviewAction,
  updateNoteAction,
} from "@/server/actions/workspace";

export function InterviewForm({ applicationId }: { applicationId: string }) {
  const [state, action, pending] = useActionState(
    createInterviewAction.bind(null, applicationId),
    {} as FormState,
  );
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
      <Field id="scheduledAt" name="scheduledAt" label="Date and time" type="datetime-local" required />
      <SelectField id="type" name="type" label="Type" defaultValue="TECHNICAL">
        {INTERVIEW_TYPES.map((type) => (
          <option key={type} value={type}>
            {interviewTypeLabels[type]}
          </option>
        ))}
      </SelectField>
      <Field id="interviewerName" name="interviewerName" label="Interviewer" />
      <Field id="meetingUrl" name="meetingUrl" label="Meeting URL" type="url" />
      <TextAreaField id="notes" name="notes" label="Prep notes" />
      <SubmitButton pending={pending} idle="Add interview" />
    </form>
  );
}

export function InterviewUpdateForm({
  applicationId,
  interview,
}: {
  applicationId: string;
  interview: {
    id: string;
    scheduledAt: string | null;
    type: keyof typeof interviewTypeLabels;
    interviewerName: string | null;
    meetingUrl: string | null;
    status: string;
    outcome: string | null;
    notes: string | null;
  };
}) {
  const [state, action, pending] = useActionState(
    updateInterviewAction.bind(null, applicationId, interview.id),
    {} as FormState,
  );

  return (
    <form action={action} className="mt-3 space-y-3">
      {state.message ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
      <Field
        id={`scheduledAt-${interview.id}`}
        name="scheduledAt"
        label="Date and time"
        type="datetime-local"
        defaultValue={toDateTimeLocal(interview.scheduledAt)}
      />
      <Field
        id={`interviewerName-${interview.id}`}
        name="interviewerName"
        label="Interviewer"
        defaultValue={interview.interviewerName ?? ""}
      />
      <Field
        id={`meetingUrl-${interview.id}`}
        name="meetingUrl"
        label="Meeting URL"
        type="url"
        defaultValue={interview.meetingUrl ?? ""}
      />
      <TextAreaField
        id={`notes-${interview.id}`}
        name="notes"
        label="Prep notes"
        defaultValue={interview.notes ?? ""}
        rows={3}
      />
      <SelectField
        id={`outcome-${interview.id}`}
        name="outcome"
        label="Outcome"
        defaultValue={interview.outcome ?? "PENDING"}
      >
        {INTERVIEW_OUTCOMES.map((outcome) => (
          <option key={outcome} value={outcome}>
            {interviewOutcomeLabels[outcome]}
          </option>
        ))}
      </SelectField>
      {interview.status !== "COMPLETED" ? (
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="status" value="COMPLETED" />
          Mark completed
        </label>
      ) : (
        <input type="hidden" name="status" value="COMPLETED" />
      )}
      <SubmitButton pending={pending} idle="Save interview" />
    </form>
  );
}

export function NoteForm({ applicationId }: { applicationId: string }) {
  const [state, action, pending] = useActionState(
    createNoteAction.bind(null, applicationId),
    {} as FormState,
  );
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
      <TextAreaField id="content" name="content" label="Note" />
      <SubmitButton pending={pending} idle="Add note" />
    </form>
  );
}

export function NoteEditForm({
  applicationId,
  note,
}: {
  applicationId: string;
  note: { id: string; content: string };
}) {
  const [state, action, pending] = useActionState(
    updateNoteAction.bind(null, applicationId, note.id),
    {} as FormState,
  );
  return (
    <form action={action} className="mt-3 space-y-3">
      {state.message ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
      <TextAreaField
        id={`content-${note.id}`}
        name="content"
        label="Note"
        defaultValue={note.content}
        rows={3}
      />
      <SubmitButton pending={pending} idle="Save note" />
    </form>
  );
}

export function FollowUpForm({ applicationId }: { applicationId: string }) {
  const [state, action, pending] = useActionState(
    createFollowUpAction.bind(null, applicationId),
    {} as FormState,
  );
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
      <Field id="dueAt" name="dueAt" label="Due" type="datetime-local" required />
      <SelectField id="type" name="type" label="Type" defaultValue="RECRUITER">
        {FOLLOW_UP_TYPES.map((type) => (
          <option key={type} value={type}>
            {followUpTypeLabels[type]}
          </option>
        ))}
      </SelectField>
      <TextAreaField id="note" name="note" label="Note" rows={2} />
      <SubmitButton pending={pending} idle="Add follow-up" />
    </form>
  );
}

export function ContactForm({
  applicationId,
  companies,
}: {
  applicationId: string;
  companies: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    createLinkedContactAction.bind(null, applicationId),
    {} as FormState,
  );
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p className="text-sm text-[var(--danger)]">{state.message}</p>
      ) : null}
      <Field id="name" name="name" label="Name" required />
      <Field id="role" name="role" label="Role" />
      <Field id="email" name="email" label="Email" type="email" />
      <Field id="linkedinUrl" name="linkedinUrl" label="LinkedIn URL" type="url" />
      <SelectField id="companyId" name="companyId" label="Company">
        <option value="">None</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </SelectField>
      <SubmitButton pending={pending} idle="Add contact" />
    </form>
  );
}
