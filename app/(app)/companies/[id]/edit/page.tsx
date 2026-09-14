import Link from "next/link";

import { CompanyForm } from "@/components/companies/company-form";
import { loadOrNotFound } from "@/lib/load-or-not-found";
import { requireUser } from "@/server/authorization/require-user";
import { getCompany } from "@/server/services/company-service";

export const metadata = { title: "Edit company" };

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const company = await loadOrNotFound(() => getCompany(user.id, id));

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/companies" className="text-sm text-stone-600 hover:text-stone-900">
        ← Companies
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Edit company</h1>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <CompanyForm
          companyId={id}
          values={{
            name: company.name,
            website: company.website,
            industry: company.industry,
            location: company.location,
            notes: company.notes,
          }}
        />
      </div>
    </div>
  );
}
