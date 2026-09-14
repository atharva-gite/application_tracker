import Link from "next/link";

import { APPLICATION_STATUSES } from "@/lib/validation/application";
import { statusLabels } from "@/lib/labels";
import { withQuery } from "@/lib/query-string";

export function ApplicationFilters({
  query,
  companies,
}: {
  query: {
    q?: string;
    status?: string;
    companyId?: string;
    location?: string;
    source?: string;
    deadlineFrom?: string;
    deadlineTo?: string;
    sort?: string;
    order?: string;
    view?: string;
    archived?: string;
  };
  companies: { id: string; name: string }[];
}) {
  const extraOpen = Boolean(
    query.companyId ||
      query.location ||
      query.source ||
      query.deadlineFrom ||
      query.deadlineTo ||
      query.archived === "only" ||
      query.archived === "true",
  );

  return (
    <form className="card space-y-4 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          name="q"
          defaultValue={query.q}
          placeholder="Search role, company, source…"
          className="input lg:flex-1"
        />
        <select name="status" defaultValue={query.status ?? ""} className="input lg:w-44">
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
            href={withQuery("/applications", { ...query, view: "list", page: 1 })}
            className={`rounded-lg px-3 py-1.5 text-sm ${query.view !== "board" ? "bg-white font-medium shadow-sm" : "text-stone-600"}`}
          >
            List
          </Link>
          <Link
            href={withQuery("/applications", { ...query, view: "board", page: 1 })}
            className={`rounded-lg px-3 py-1.5 text-sm ${query.view === "board" ? "bg-white font-medium shadow-sm" : "text-stone-600"}`}
          >
            Pipeline
          </Link>
        </div>
      </div>
      <details className="text-sm" open={extraOpen}>
        <summary className="cursor-pointer font-medium text-stone-700">More filters</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select name="companyId" defaultValue={query.companyId ?? ""} className="input">
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
          />
          <input
            name="source"
            defaultValue={query.source}
            placeholder="Source"
            className="input"
          />
          <select name="archived" defaultValue={query.archived ?? "false"} className="input">
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
          <select name="sort" defaultValue={query.sort ?? "updatedAt"} className="input">
            <option value="updatedAt">Recently updated</option>
            <option value="deadline">Deadline</option>
            <option value="applicationDate">Application date</option>
            <option value="roleTitle">Role</option>
            <option value="status">Stage</option>
          </select>
          <select name="order" defaultValue={query.order ?? "desc"} className="input">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </details>
      <input type="hidden" name="view" value={query.view ?? "list"} />
    </form>
  );
}
