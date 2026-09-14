import Link from "next/link";

import { withQuery } from "@/lib/query-string";

export function Pagination({
  pathname,
  query,
  page,
  pageSize,
  total,
}: {
  pathname: string;
  query: Record<string, string | number | undefined | null>;
  page: number;
  pageSize: number;
  total: number;
}) {
  if (total <= pageSize) {
    return null;
  }

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
      <p>
        Showing {from}–{to} of {total}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={withQuery(pathname, { ...query, page: page - 1 })}
            className="rounded-md bg-white px-3 py-1.5 ring-1 ring-border"
          >
            Previous
          </Link>
        ) : null}
        {page < lastPage ? (
          <Link
            href={withQuery(pathname, { ...query, page: page + 1 })}
            className="rounded-md bg-white px-3 py-1.5 ring-1 ring-border"
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
