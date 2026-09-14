"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  applicationCreateSchema,
  applicationStatusSchema,
  applicationUpdateSchema,
} from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { formObject, toFormState, type FormState } from "@/server/actions/form-state";
import { requireUser } from "@/server/authorization/require-user";
import {
  archiveApplication,
  changeApplicationStatus,
  createApplication,
  updateApplication,
} from "@/server/services/application-service";
import { linkApplicationDocument } from "@/server/services/document-service";

export async function createApplicationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let id: string;
  try {
    const user = await requireUser();
    const payload = formObject(formData);
    const application = await createApplication(
      user.id,
      parseSchema(applicationCreateSchema, payload),
    );
    if (payload.documentId) {
      await linkApplicationDocument(user.id, application.id, payload.documentId);
    }
    id = application.id;
  } catch (error) {
    return toFormState(error);
  }
  redirect(`/applications/${id}`);
}

export async function updateApplicationAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await updateApplication(
      user.id,
      id,
      parseSchema(applicationUpdateSchema, formObject(formData)),
    );
  } catch (error) {
    return toFormState(error);
  }
  redirect(`/applications/${id}`);
}

export async function changeStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("applicationId") ?? "");
  const input = parseSchema(applicationStatusSchema, {
    status: formData.get("status"),
  });
  await changeApplicationStatus(user.id, id, input);
  revalidatePath(`/applications/${id}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function archiveApplicationAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("applicationId") ?? "");
  await archiveApplication(user.id, id);
  redirect("/applications");
}
