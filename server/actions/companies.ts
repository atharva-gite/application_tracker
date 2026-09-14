"use server";

import { redirect } from "next/navigation";

import { companyInputSchema, companyUpdateSchema } from "@/lib/validation/company";
import { parseSchema } from "@/lib/validation/helpers";
import { formObject, toFormState, type FormState } from "@/server/actions/form-state";
import { requireUser } from "@/server/authorization/require-user";
import {
  createCompany,
  deleteCompany,
  updateCompany,
} from "@/server/services/company-service";

export async function createCompanyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await createCompany(user.id, parseSchema(companyInputSchema, formObject(formData)));
  } catch (error) {
    return toFormState(error);
  }
  redirect("/companies");
}

export async function updateCompanyAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const user = await requireUser();
    await updateCompany(user.id, id, parseSchema(companyUpdateSchema, formObject(formData)));
  } catch (error) {
    return toFormState(error);
  }
  redirect("/companies");
}

export async function deleteCompanyAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("companyId") ?? "");
  await deleteCompany(user.id, id);
  redirect("/companies");
}
