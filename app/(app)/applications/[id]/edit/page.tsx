import Link from "next/link";

import { ApplicationForm } from "@/components/applications/application-form";
import { loadOrNotFound } from "@/lib/load-or-not-found";
import { requireUser } from "@/server/authorization/require-user";
import { getApplication } from "@/server/services/application-service";
import { listCompanies } from "@/server/services/company-service";

export const metadata = { title: "Edit application" };

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [application, { companies }] = await loadOrNotFound(() =>
    Promise.all([
      getApplication(user.id, id),
      listCompanies(user.id, { page: 1, pageSize: 100 }),
    ]),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm">
        <Link href={`/applications/${id}`} className="text-stone-600 hover:text-stone-900">
          ← Back to application
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Edit application</h1>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <ApplicationForm
          companies={companies}
          applicationId={id}
          values={{
            companyId: application.company.id,
            roleTitle: application.roleTitle,
            jobUrl: application.jobUrl ?? undefined,
            location: application.location ?? undefined,
            employmentType: application.employmentType,
            status: application.status,
            applicationDate: application.applicationDate,
            deadline: application.deadline,
            source: application.source,
            salaryMin: application.salaryMin,
            salaryMax: application.salaryMax,
            salaryCurrency: application.salaryCurrency,
            description: application.description,
          }}
        />
      </div>
    </div>
  );
}
