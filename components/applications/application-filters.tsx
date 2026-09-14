import Link from "next/link";

import {
  applicationFilterQuery,
  hasActiveApplicationFilters,
  resetApplicationsHref,
} from "@/lib/application-list";
import { statusLabels } from "@/lib/labels";
import { withQuery } from "@/lib/query-string";
import {
  APPLICATION_STATUSES,
  applicationDueFilters,
  type ApplicationListQuery,
} from "@/lib/validation/application";

export function ApplicationFilters({
  query,
  companies,
}: {
  query: ApplicationListQuery;
  companies: { id: string; name: string }[];
}) {
  const extraOpen = Boolean(
    query.companyId ||
      query.location ||
      query.source ||
      query.due ||
      query.deadlineFrom ||
      query.deadlineTo ||
      query.appliedFrom ||
      query.appliedTo ||
      query.archived === "only" ||
      query.archived === "true",
  );
  const view = query.view === "board" ? "board" : "list";
  const filters = applicationFilterQuery(query, view);

  return (
    <form method="get" action="/applications" className="card space-y-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          name="q"
          defaultValue={query.q}
          placeholder="Search company or role"
          className="input min-w-[12rem] flex-1"
          aria-label="Search company or role"
        />
        <select name="status" defaultValue={query.status ?? ""} className="input sm:w-44" aria-label="Stage">
          <option value="">All stages</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">
          Apply filters
        </button>
        <div className="flex rounded-xl bg-stone-100 p-1">
          <Link
            href={withQuery("/applications", { ...filters, view: "list", page: 1 })}
            className={`rounded-lg px-3 py-1.5 text-sm ${view !== "board" ? "bg-white font-medium shadow-sm" : "text-stone-600"}`}
          >
            List
          </Link>
          <Link
            href={withQuery("/applications", { ...filters, view: "board", page: 1 })}
            className={`rounded-lg px-3 py-1.5 text-sm ${view === "board" ? "bg-white font-medium shadow-sm" : "text-stone-600"}`}
          >
            Board
          </Link>
        </div>
      </div>
      <details className="text-sm" open={extraOpen}>
        <summary className="cursor-pointer font-medium text-stone-700">More filters</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select name="companyId" defaultValue={query.companyId ?? ""} className="input" aria-label="Company">
            <option value="">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <input
            name="location"
            defaultValue={query.location}
            placeholder="Location"
            className="input"
            aria-label="Location"
          />
          <input
            name="source"
            defaultValue={query.source}
            placeholder="Source"
            className="input"
            aria-label="Source"
          />
          <select name="due" defaultValue={query.due ?? ""} className="input" aria-label="Deadline">
            <option value="">Any deadline</option>
            {applicationDueFilters.map((due) => (
              <option key={due} value={due}>
                {due === "none"
                  ? "No deadline"
                  : due === "overdue"
                    ? "Overdue"
                    : due === "today"
                      ? "Due today"
                      : due === "tomorrow"
                        ? "Due tomorrow"
                        : "Upcoming"}
              </option>
            ))}
          </select>
          <select name="archived" defaultValue={query.archived ?? "false"} className="input" aria-label="Archived">
            <option value="false">Active</option>
            <option value="only">Archived</option>
            <option value="true">All</option>
          </select>
          <label className="text-sm text-stone-600">
            Deadline from
            <input
              name="deadlineFrom"
              type="date"
              defaultValue={query.deadlineFrom}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-stone-600">
            Deadline to
            <input
              name="deadlineTo"
              type="date"
              defaultValue={query.deadlineTo}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-stone-600">
            Applied from
            <input
              name="appliedFrom"
              type="date"
              defaultValue={query.appliedFrom}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-stone-600">
            Applied to
            <input
              name="appliedTo"
              type="date"
              defaultValue={query.appliedTo}
              className="input mt-1"
            />
          </label>
          <select name="sort" defaultValue={query.sort ?? "lastActivity"} className="input" aria-label="Sort by">
            <option value="lastActivity">Last activity</option>
            <option value="deadline">Deadline</option>
            <option value="applicationDate">Application date</option>
            <option value="company">Company</option>
            <option value="roleTitle">Role</option>
          </select>
          <select name="order" defaultValue={query.order ?? "desc"} className="input" aria-label="Sort order">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </details>
      {hasActiveApplicationFilters(query) ? (
        <p className="text-sm">
          <Link href={resetApplicationsHref(view)} className="text-stone-600 underline-offset-2 hover:underline">
            Reset filters
          </Link>
        </p>
      ) : null}
      <input type="hidden" name="view" value={view} />
    </form>
  );
}
