import Link from "next/link";

import { ApplicationBoard } from "@/components/applications/application-board";
import { ApplicationFilters } from "@/components/applications/application-filters";
import { ApplicationRow } from "@/components/applications/application-row";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import {
  applicationDetailPath,
  applicationFilterQuery,
  hasActiveApplicationFilters,
  resetApplicationsHref,
  sortHeaderQuery,
} from "@/lib/application-list";
import { deadlineToneClass, describeDeadline, describePast } from "@/lib/attention";
import { withQuery } from "@/lib/query-string";
import { applicationListQuerySchema } from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import { listApplications } from "@/server/services/application-service";
import { listCompanies } from "@/server/services/company-service";

export const metadata = { title: "Applications" };

function SortHeader({
  field,
  label,
  query,
}: {
  field: string;
  label: string;
  query: Record<string, string | number | undefined | null>;
}) {
  const active =
    query.sort === field || (field === "lastActivity" && query.sort === "updatedAt");
  return (
    <th className="px-4 py-3 font-medium">
      <Link
        href={withQuery("/applications", sortHeaderQuery(query, field))}
        className={`hover:text-stone-800 ${active ? "text-stone-800" : ""}`}
      >
        {label}
        {active ? (query.order === "asc" ? " ↑" : " ↓") : ""}
      </Link>
    </th>
  );
}

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
  const filterQuery = applicationFilterQuery(query, view);
  const filtered = hasActiveApplicationFilters(query);
  const showBoard = view === "board" && (applications.length > 0 || filtered);

  return (
    <div className={`mx-auto space-y-8 ${showBoard ? "max-w-none" : "max-w-6xl"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
          <p className="mt-2 text-sm text-stone-600">
            {total} {total === 1 ? "application" : "applications"}
            {filtered
              ? total === 1
                ? " matches your filters."
                : " match your filters."
              : " in your pipeline."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action="/api/applications/export" method="get">
            <button type="submit" className="btn-secondary">
              Export CSV
            </button>
          </form>
          <Link href="/applications/import" className="btn-secondary">
            Import CSV
          </Link>
          <Link href="/applications/new" className="btn-primary">
            Add application
          </Link>
        </div>
      </div>

      <ApplicationFilters query={query} companies={companies} />

      {applications.length === 0 && !showBoard ? (
        filtered ? (
          <section className="card border-dashed p-8">
            <h2 className="text-lg font-medium">No applications match your filters.</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600">
              Try a different search, stage, or deadline, or clear the current filters.
            </p>
            <Link href={resetApplicationsHref(view)} className="btn-secondary mt-5">
              Reset filters
            </Link>
          </section>
        ) : (
          <section className="card border-dashed p-8">
            <h2 className="text-lg font-medium">No applications yet</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600">
              Add your first application to start tracking your job search.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/applications/new" className="btn-primary">
                Add application
              </Link>
              <Link href="/applications/import" className="btn-secondary">
                Import CSV
              </Link>
            </div>
          </section>
        )
      ) : showBoard ? (
        <ApplicationBoard
          key={`${query.q ?? ""}:${query.status ?? ""}:${query.companyId ?? ""}:${query.due ?? ""}:${query.archived ?? ""}:${total}`}
          applications={applications}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="hidden w-full min-w-[40rem] text-left text-sm sm:table">
              <thead className="border-b border-border text-stone-500">
                <tr>
                  <SortHeader field="company" label="Company" query={filterQuery} />
                  <SortHeader field="roleTitle" label="Role" query={filterQuery} />
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <SortHeader field="deadline" label="Deadline" query={filterQuery} />
                  <SortHeader field="lastActivity" label="Last activity" query={filterQuery} />
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => {
                  const due = describeDeadline(item.deadline);
                  const activity = item.lastActivityAt ?? item.updatedAt ?? item.createdAt;
                  return (
                    <ApplicationRow
                      key={item.id}
                      id={item.id}
                      company={item.company.name}
                      roleTitle={item.roleTitle}
                    >
                      <span className="font-medium">{item.company.name}</span>
                      <span>{item.roleTitle}</span>
                      <StatusBadge status={item.status} />
                      <span className={deadlineToneClass(due.kind)}>{due.label}</span>
                      <span className="text-stone-600">
                        {activity ? describePast(activity) : "—"}
                      </span>
                    </ApplicationRow>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-border sm:hidden">
            {applications.map((item) => {
              const due = describeDeadline(item.deadline);
              const activity = item.lastActivityAt ?? item.updatedAt ?? item.createdAt;
              return (
                <Link
                  key={item.id}
                  href={applicationDetailPath(item.id)}
                  className="block p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.company.name}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{item.roleTitle}</p>
                  <p className={`mt-1 text-xs ${deadlineToneClass(due.kind)}`}>
                    {due.kind === "none" ? "No deadline" : due.label}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {activity ? describePast(activity) : null}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {view === "list" ? (
        <Pagination
          pathname="/applications"
          query={filterQuery}
          page={page}
          pageSize={pageSize}
          total={total}
        />
      ) : total > pageSize ? (
        <p className="text-sm text-stone-500">Showing the first {pageSize} matching applications.</p>
      ) : null}
    </div>
  );
}
