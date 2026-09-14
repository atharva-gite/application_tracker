"use server";

import { revalidatePath } from "next/cache";

import { contactInputSchema } from "@/lib/validation/contact";
import { followUpInputSchema } from "@/lib/validation/follow-up";
import { parseSchema } from "@/lib/validation/helpers";
import { interviewInputSchema, interviewUpdateSchema } from "@/lib/validation/interview";
import { noteInputSchema, noteUpdateSchema } from "@/lib/validation/note";
import { formObject, toFormState, type FormState } from "@/server/actions/form-state";
import { requireUser } from "@/server/authorization/require-user";
import { createContact, linkApplicationContact } from "@/server/services/contact-service";
import {
  createFollowUp,
  updateFollowUp,
} from "@/server/services/follow-up-service";
import {
  createInterview,
  updateInterview,
} from "@/server/services/interview-service";
import { createNote, updateNote } from "@/server/services/note-service";

function refresh(applicationId: string, interviewId?: string) {
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  revalidatePath("/interviews");
  revalidatePath("/analytics");
  if (interviewId) {
    revalidatePath(`/interviews/${interviewId}`);
  }
}

export async function createInterviewAction(
  applicationId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await createInterview(
      user.id,
      applicationId,
      parseSchema(interviewInputSchema, formObject(formData)),
    );
    refresh(applicationId);
    return {};
  } catch (error) {
    return toFormState(error);
  }
}

export async function updateInterviewAction(
  applicationId: string,
  interviewId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await updateInterview(
      user.id,
      interviewId,
      parseSchema(interviewUpdateSchema, formObject(formData)),
    );
    refresh(applicationId, interviewId);
    return {};
  } catch (error) {
    return toFormState(error);
  }
}

export async function createNoteAction(
  applicationId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await createNote(
      user.id,
      applicationId,
      parseSchema(noteInputSchema, formObject(formData)),
    );
    refresh(applicationId);
    return {};
  } catch (error) {
    return toFormState(error);
  }
}

export async function updateNoteAction(
  applicationId: string,
  noteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await updateNote(
      user.id,
      noteId,
      parseSchema(noteUpdateSchema, formObject(formData)),
    );
    refresh(applicationId);
    return {};
  } catch (error) {
    return toFormState(error);
  }
}

export async function createFollowUpAction(
  applicationId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await createFollowUp(
      user.id,
      applicationId,
      parseSchema(followUpInputSchema, formObject(formData)),
    );
    refresh(applicationId);
    return {};
  } catch (error) {
    return toFormState(error);
  }
}

export async function completeFollowUpAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("followUpId") ?? "");
  const applicationId = String(formData.get("applicationId") ?? "");
  await updateFollowUp(user.id, id, { completed: true });
  if (applicationId) {
    refresh(applicationId);
  }
  revalidatePath("/dashboard");
}

export async function createLinkedContactAction(
  applicationId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    const contact = await createContact(
      user.id,
      parseSchema(contactInputSchema, formObject(formData)),
    );
    await linkApplicationContact(user.id, applicationId, { contactId: contact.id });
    refresh(applicationId);
    return {};
  } catch (error) {
    return toFormState(error);
  }
}
