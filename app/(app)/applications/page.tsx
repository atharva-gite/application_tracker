import Link from "next/link";

import { describeWhen } from "@/lib/attention";
import { ApplicationFilters } from "@/components/applications/application-filters";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { statusLabels } from "@/lib/labels";
import { applicationListQuerySchema } from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { APPLICATION_STATUSES } from "@/lib/validation/application";
import { requireUser } from "@/server/authorization/require-user";
import { listApplications } from "@/server/services/application-service";
import { listCompanies } from "@/server/services/company-service";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const raw = await searchParams;
  const flattened = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  const view = flattened.view === "board" ? "board" : "list";
  const query = parseSchema(applicationListQuerySchema, {
    ...flattened,
    pageSize: view === "board" ? "100" : flattened.pageSize,
  });
  const [{ applications, total, page, pageSize }, { companies }] = await Promise.all([
    listApplications(user.id, query),
    listCompanies(user.id, { page: 1, pageSize: 100 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
          <p className="mt-2 text-sm text-stone-600">
            {total} {total === 1 ? "application" : "applications"} in your pipeline.
          </p>
        </div>
        <Link href="/applications/new" className="btn-primary">
          Add application
        </Link>
      </div>

      <ApplicationFilters query={{ ...query, view }} companies={companies} />

      {applications.length === 0 ? (
        <section className="card border-dashed p-8">
          <h2 className="text-lg font-medium">No applications yet</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600">
            Add your first application to start tracking your job search.
          </p>
          <Link href="/applications/new" className="btn-primary mt-5">
            Add application
          </Link>
        </section>
      ) : view === "board" ? (
        <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-4">
          {APPLICATION_STATUSES.map((status) => {
            const items = applications.filter((item) => item.status === status);
            return (
              <section key={status} className="card min-w-[16rem] p-4">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-medium">{statusLabels[status]}</h2>
                  <span className="text-xs text-stone-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => {
                    const due = item.deadline ? describeWhen(item.deadline) : null;
                    return (
                    <Link
                      key={item.id}
                      href={`/applications/${item.id}`}
                      className="block rounded-xl bg-white p-3 ring-1 ring-border hover:ring-stone-300"
                    >
                      <p className="text-sm font-medium">{item.company.name}</p>
                      <p className="text-sm text-stone-600">{item.roleTitle}</p>
                      {due ? (
                        <p
                          className={`mt-1 text-xs ${
                            due.overdue ? "text-[var(--danger)]" : "text-stone-500"
                          }`}
                        >
                          {due.overdue ? "Overdue" : "Due"} {due.label}
                        </p>
                      ) : null}
                    </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="hidden w-full text-left text-sm sm:table">
            <thead className="border-b border-border text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((item) => {
                const due = item.deadline ? describeWhen(item.deadline) : null;
                return (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/applications/${item.id}`} className="font-medium hover:underline">
                      {item.company.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.roleTitle}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td
                    className={`px-4 py-3 ${due?.overdue ? "text-[var(--danger)]" : "text-stone-600"}`}
                  >
                    {due ? `${due.overdue ? "Overdue · " : ""}${due.label}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{item.source ?? "—"}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
          <div className="divide-y divide-border sm:hidden">
            {applications.map((item) => (
              <Link key={item.id} href={`/applications/${item.id}`} className="block p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.company.name}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-stone-600">{item.roleTitle}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Pagination
        pathname="/applications"
        query={{
          q: query.q,
          status: query.status,
          companyId: query.companyId,
          location: query.location,
          source: query.source,
          deadlineFrom: query.deadlineFrom,
          deadlineTo: query.deadlineTo,
          sort: query.sort,
          order: query.order,
          view,
          archived: query.archived,
        }}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </div>
  );
}
