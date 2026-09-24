import Link from "next/link";

import { rateLabel, rateIsReady } from "@/lib/analytics-math";
import {
  ANALYTICS_RANGE_LABELS,
  ANALYTICS_RANGES,
  analyticsPeriodStart,
  isAnalyticsRange,
  type AnalyticsRange,
} from "@/lib/analytics-period";
import { statusLabels } from "@/lib/labels";
import { withQuery } from "@/lib/query-string";
import { requireUser } from "@/server/authorization/require-user";
import { getJobSearchAnalytics } from "@/server/services/analytics-service";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const raw = await searchParams;
  const rangeValue = Array.isArray(raw.range) ? raw.range[0] : raw.range;
  const range = isAnalyticsRange(rangeValue) ? rangeValue : "30";
  const analytics = await getJobSearchAnalytics(user.id, range);
  const since = analyticsPeriodStart(range);
  const empty = analytics.applications === 0;
  const stageMax = Math.max(1, ...analytics.byStatus.map((row) => row.count));
  const sourceMax = Math.max(
    1,
    ...analytics.bySource.map((row) => row.applications),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-stone-600">
            How this job search is performing
            {range === "all"
              ? ", all time."
              : `, ${ANALYTICS_RANGE_LABELS[range].toLowerCase()}.`}
          </p>
        </div>
        <RangeLinks range={range} />
      </div>

      {empty ? (
        <section className="card p-6 text-center sm:p-8">
          <p className="text-sm text-stone-600">
            {range === "all"
              ? "Add applications to see how your search is converting."
              : "No applications in this range. Try a longer window, or add a role."}
          </p>
          <Link href="/applications/new" className="btn-primary mt-4">
            Add application
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <Metric
              label="Applications"
              value={String(analytics.applications)}
              detail={
                since
                  ? `Roles dated on or after ${since.toISOString().slice(0, 10)}. Saved roles are included.`
                  : "Every tracked role, including Saved."
              }
            />
            <Metric
              label="Interviews"
              value={String(analytics.interviews)}
              detail="Applications that reached Interview or Offer, or have an interview scheduled. Same definition as the dashboard."
            />
            <Metric
              label="Offers"
              value={String(analytics.offers)}
              detail="Applications that reached Offer, even if they later moved to Rejected or Withdrawn. The dashboard Offers count is the current Offer stage."
            />
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <Metric
              label="Application → Interview"
              value={rateLabel(analytics.applicationToInterview, analytics.submitted)}
              detail={
                analytics.submitted === 0
                  ? "Rate is undefined until an application leaves Saved."
                  : `${analytics.interviews} of ${analytics.submitted} submitted applications reached an interview. Submitted means not Saved, or already at interview.`
              }
            />
            <Metric
              label="Interview → Offer"
              value={rateLabel(analytics.interviewToOffer, analytics.interviews)}
              detail={
                analytics.interviews === 0
                  ? "Rate is undefined until an application reaches interview."
                  : `${analytics.offers} of ${analytics.interviews} interview applications reached Offer. Multiple interview records on one role still count as one.`
              }
            />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-medium">Current stages</h2>
            <p className="mt-1 text-sm text-stone-600">
              Snapshot of where applications sit now, not where they have been.
            </p>
            <ul className="mt-4 space-y-2">
              {analytics.byStatus.map((row) => (
                <li key={row.status}>
                  <div className="flex justify-between text-sm">
                    <Link
                      href={`/applications?status=${row.status}`}
                      className="hover:underline"
                    >
                      {statusLabels[row.status]}
                    </Link>
                    <span className="tabular-nums text-stone-600">{row.count}</span>
                  </div>
                  <Bar value={row.count} max={stageMax} />
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-medium">By source</h2>
            <p className="mt-1 text-sm text-stone-600">
              Interview count is applications that reached interview from that
              source, not the number of interview meetings.
            </p>
            {analytics.bySource.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">
                Add a source when you create applications to compare them.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-stone-500">
                      <th className="pb-2 font-medium">Source</th>
                      <th className="pb-2 font-medium">Applications</th>
                      <th className="pb-2 font-medium">Interviews</th>
                      <th className="pb-2 font-medium">Interview rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.bySource.map((row) => (
                      <tr key={row.source} className="border-b border-border/70 last:border-0">
                        <td className="py-2.5">
                          <div>{row.source}</div>
                          <Bar value={row.applications} max={sourceMax} />
                        </td>
                        <td className="py-2.5 tabular-nums">{row.applications}</td>
                        <td className="py-2.5 tabular-nums">{row.interviews}</td>
                        <td className="py-2.5 text-stone-600">
                          {rateIsReady(row.applications)
                            ? rateLabel(row.interviewRate, row.applications)
                            : "Not enough data yet"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-medium">Time in stage</h2>
            <p className="mt-1 text-sm text-stone-600">
              Completed stages use the time between status history transitions.
              The current stage uses elapsed time until now. Rejected and
              Withdrawn are not kept running after they become the last status.
            </p>
            {analytics.timeInStage.some((row) => row.averageDays !== null) ? (
              <ul className="mt-3 space-y-2 text-sm">
                {analytics.timeInStage
                  .filter((row) => row.averageDays !== null)
                  .map((row) => (
                    <li key={row.status} className="flex justify-between gap-4">
                      <Link
                        href={`/applications?status=${row.status}`}
                        className="hover:underline"
                      >
                        {statusLabels[row.status]}
                      </Link>
                      <span className="tabular-nums text-stone-600">
                        {row.averageDays === 0 ? "< 0.1" : row.averageDays} day
                        {row.averageDays === 1 ? "" : "s"}
                        <span className="text-stone-400">
                          {" "}
                          · {row.samples} stay{row.samples === 1 ? "" : "s"}
                        </span>
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-stone-600">
                Move an application between stages to measure time in each one.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function RangeLinks({ range }: { range: AnalyticsRange }) {
  return (
    <nav
      aria-label="Time range"
      className="flex flex-wrap gap-1 rounded-lg bg-white p-1 ring-1 ring-border"
    >
      {ANALYTICS_RANGES.map((value) => {
        const active = value === range;
        return (
          <Link
            key={value}
            href={withQuery("/analytics", { range: value })}
            className={`rounded-md px-2.5 py-1.5 text-sm font-medium ${
              active
                ? "bg-accent text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {ANALYTICS_RANGE_LABELS[value]}
          </Link>
        );
      })}
    </nav>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-stone-600">{detail}</p>
    </div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  const width = Math.round((value / max) * 100);
  return (
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: value === 0 ? "0%" : `${Math.max(width, 4)}%` }}
      />
    </div>
  );
}
