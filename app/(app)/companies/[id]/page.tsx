import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { loadOrNotFound } from "@/lib/load-or-not-found";
import { requireUser } from "@/server/authorization/require-user";
import { listApplications } from "@/server/services/application-service";
import { getCompany } from "@/server/services/company-service";

export const metadata = { title: "Company" };

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [company, applications] = await loadOrNotFound(() =>
    Promise.all([
      getCompany(user.id, id),
      listApplications(user.id, {
        page: 1,
        pageSize: 50,
        companyId: id,
        archived: "true",
      }),
    ]),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/companies" className="text-sm text-stone-600 hover:text-stone-900">
        ← Companies
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <p className="mt-1 text-sm text-stone-600">
            {[company.industry, company.location].filter(Boolean).join(" · ") ||
              "No industry or location yet."}
          </p>
        </div>
        <Link
          href={`/companies/${id}/edit`}
          className="rounded-md bg-white px-3 py-2 text-sm ring-1 ring-border"
        >
          Edit
        </Link>
      </div>
      <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
        {company.website ? (
          <p>
            <a href={company.website} className="text-accent hover:underline">
              {company.website}
            </a>
          </p>
        ) : null}
        <p className="mt-3 whitespace-pre-wrap text-stone-700">
          {company.notes || "No notes yet."}
        </p>
      </section>
      <section className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-medium">Applications</h2>
          <Link href="/applications/new" className="text-sm text-accent">
            Add application
          </Link>
        </div>
        {applications.applications.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone-600">
            No applications at this company yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {applications.applications.map((item) => (
              <li key={item.id}>
                <Link href={`/applications/${item.id}`} className="flex items-center justify-between gap-3 px-5 py-4">
                  <span>{item.roleTitle}</span>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
