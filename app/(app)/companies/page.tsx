import Link from "next/link";

import { CompanyForm } from "@/components/companies/company-form";
import { requireUser } from "@/server/authorization/require-user";
import { listCompanies } from "@/server/services/company-service";
import { deleteCompanyAction } from "@/server/actions/companies";

export const metadata = { title: "Companies" };

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const { companies } = await listCompanies(user.id, {
    page: 1,
    pageSize: 100,
    q,
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Companies</h1>
        <p className="mt-2 text-sm text-stone-600">
          Company names are unique per account so you do not create duplicates.
        </p>
        <form className="mt-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search companies"
            className="input max-w-sm"
            aria-label="Search companies"
          />
        </form>
        {companies.length === 0 ? (
          <section className="card mt-8 border-dashed p-8">
            <h2 className="font-medium">No companies yet</h2>
            <p className="mt-2 text-sm text-stone-600">
              Add a company here or while creating an application.
            </p>
          </section>
        ) : (
          <ul className="card mt-8 divide-y divide-border overflow-hidden">
            {companies.map((company) => (
              <li key={company.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/companies/${company.id}`} className="font-medium hover:underline">
                    {company.name}
                  </Link>
                  <p className="text-sm text-stone-600">
                    {company.applicationCount ?? 0} applications
                    {company.location ? ` · ${company.location}` : ""}
                  </p>
                </div>
                <form action={deleteCompanyAction}>
                  <input type="hidden" name="companyId" value={company.id} />
                  <button className="text-sm text-[var(--danger)]">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="card h-fit p-6">
        <h2 className="font-medium">Add company</h2>
        <div className="mt-4">
          <CompanyForm />
        </div>
      </aside>
    </div>
  );
}
