"use client";

import { useActionState } from "react";

import { employmentLabels, statusLabels } from "@/lib/labels";
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
} from "@/lib/validation/application";
import {
  createApplicationAction,
  updateApplicationAction,
} from "@/server/actions/applications";
import type { FormState } from "@/server/actions/form-state";
import { Field, SelectField, SubmitButton, TextAreaField } from "@/components/ui/fields";

type CompanyOption = { id: string; name: string };
type DocumentOption = { id: string; name: string };

type ApplicationValues = {
  companyId?: string;
  roleTitle?: string;
  jobUrl?: string;
  location?: string;
  employmentType?: string | null;
  status?: string;
  applicationDate?: string | null;
  deadline?: string | null;
  source?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  description?: string | null;
};

export function ApplicationForm({
  companies,
  documents = [],
  applicationId,
  values,
}: {
  companies: CompanyOption[];
  documents?: DocumentOption[];
  applicationId?: string;
  values?: ApplicationValues;
}) {
  const action = applicationId
    ? updateApplicationAction.bind(null, applicationId)
    : createApplicationAction;
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const hasCompanies = companies.length > 0;
  const hasExtra = Boolean(
    values?.location ||
      values?.employmentType ||
      values?.source ||
      values?.salaryMin ||
      values?.salaryMax ||
      values?.description,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}

      {hasCompanies ? (
        <SelectField
          id="companyId"
          name="companyId"
          label="Company"
          defaultValue={values?.companyId ?? ""}
          error={state.fieldErrors?.companyId?.[0] ?? state.fieldErrors?.companyName?.[0]}
        >
          <option value="">Enter a new company below</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </SelectField>
      ) : null}
      <Field
        id="companyName"
        name="companyName"
        label={hasCompanies ? "Or enter a new company" : "Company"}
        placeholder="Google"
        required={!hasCompanies && !values?.companyId}
        error={state.fieldErrors?.companyName?.[0]}
      />
      <Field
        id="roleTitle"
        name="roleTitle"
        label="Role"
        required
        defaultValue={values?.roleTitle}
        error={state.fieldErrors?.roleTitle?.[0]}
      />
      <Field
        id="jobUrl"
        name="jobUrl"
        label="Job URL"
        type="url"
        defaultValue={values?.jobUrl ?? ""}
        error={state.fieldErrors?.jobUrl?.[0]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          id="status"
          name="status"
          label="Stage"
          defaultValue={values?.status ?? "SAVED"}
        >
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </SelectField>
        <Field
          id="applicationDate"
          name="applicationDate"
          label="Application date"
          type="date"
          defaultValue={values?.applicationDate ?? ""}
        />
        <Field
          id="deadline"
          name="deadline"
          label="Deadline"
          type="date"
          defaultValue={values?.deadline ?? ""}
        />
      </div>
      {!applicationId && documents.length > 0 ? (
        <SelectField id="documentId" name="documentId" label="Resume">
          <option value="">Attach later</option>
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.name}
            </option>
          ))}
        </SelectField>
      ) : null}
      <details className="rounded-xl border border-border bg-white px-4 py-3" open={hasExtra}>
        <summary className="cursor-pointer text-sm font-medium">More details</summary>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="location"
              name="location"
              label="Location"
              defaultValue={values?.location ?? ""}
              error={state.fieldErrors?.location?.[0]}
            />
            <SelectField
              id="employmentType"
              name="employmentType"
              label="Employment type"
              defaultValue={values?.employmentType ?? ""}
            >
              <option value="">Not specified</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {employmentLabels[type]}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="source"
              name="source"
              label="Source"
              defaultValue={values?.source ?? ""}
              placeholder="LinkedIn, campus, referral…"
            />
            <Field
              id="salaryMin"
              name="salaryMin"
              label="Salary min"
              type="number"
              defaultValue={values?.salaryMin?.toString() ?? ""}
            />
            <Field
              id="salaryMax"
              name="salaryMax"
              label="Salary max"
              type="number"
              defaultValue={values?.salaryMax?.toString() ?? ""}
            />
          </div>
          <Field
            id="salaryCurrency"
            name="salaryCurrency"
            label="Currency"
            defaultValue={values?.salaryCurrency ?? "USD"}
            placeholder="USD"
          />
          <TextAreaField
            id="description"
            name="description"
            label="Description / notes"
            defaultValue={values?.description ?? ""}
            error={state.fieldErrors?.description?.[0]}
          />
        </div>
      </details>
      <SubmitButton pending={pending} idle={applicationId ? "Save changes" : "Add application"} />
    </form>
  );
}
