"use client";

import { useActionState } from "react";

import {
  createCompanyAction,
  updateCompanyAction,
} from "@/server/actions/companies";
import type { FormState } from "@/server/actions/form-state";
import { Field, SubmitButton, TextAreaField } from "@/components/ui/fields";

type Values = {
  name?: string;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  notes?: string | null;
};

export function CompanyForm({
  companyId,
  values,
}: {
  companyId?: string;
  values?: Values;
}) {
  const action = companyId
    ? updateCompanyAction.bind(null, companyId)
    : createCompanyAction;
  const [state, formAction, pending] = useActionState(action, {} as FormState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}
      <Field
        id="name"
        name="name"
        label="Company name"
        required
        defaultValue={values?.name}
        error={state.fieldErrors?.name?.[0]}
      />
      <Field
        id="website"
        name="website"
        label="Website"
        type="url"
        defaultValue={values?.website ?? ""}
        error={state.fieldErrors?.website?.[0]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="industry"
          name="industry"
          label="Industry"
          defaultValue={values?.industry ?? ""}
        />
        <Field
          id="location"
          name="location"
          label="Location"
          defaultValue={values?.location ?? ""}
        />
      </div>
      <TextAreaField
        id="notes"
        name="notes"
        label="Notes"
        defaultValue={values?.notes ?? ""}
      />
      <SubmitButton pending={pending} idle={companyId ? "Save company" : "Add company"} />
    </form>
  );
}
