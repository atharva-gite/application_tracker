import Link from "next/link";

import { statusLabels } from "@/lib/labels";
import { requireUser } from "@/server/authorization/require-user";
import {
  getAnalyticsApplications,
  getAnalyticsConversion,
  getAnalyticsOverview,
  getAnalyticsStageDuration,
} from "@/server/services/dashboard-service";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [overview, applications, conversion, stageDuration] = await Promise.all([
    getAnalyticsOverview(user.id),
    getAnalyticsApplications(user.id),
    getAnalyticsConversion(user.id),
    getAnalyticsStageDuration(user.id),
  ]);
  const interviewRate = Math.round(conversion.applicationToInterview * 100);
  const offerRate = Math.round(conversion.interviewToOffer * 100);
  const stall = [...stageDuration.byStatus]
    .filter((row) => row.averageDays > 0 && row.status !== "REJECTED" && row.status !== "WITHDRAWN")
    .sort((left, right) => right.averageDays - left.averageDays)[0];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-stone-600">
          Answers about what is working in this search — not a second dashboard.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Question
          question="How many have I submitted?"
          answer={String(overview.applied)}
          detail="Applications that moved past Saved."
        />
        <Question
          question="Do applications become interviews?"
          answer={`${interviewRate}%`}
          detail={
            conversion.applied === 0
              ? "Nothing has moved past Saved yet."
              : `${conversion.interview} of ${conversion.applied} submitted roles reached an interview.`
          }
        />
        <Question
          question="Do interviews become offers?"
          answer={`${offerRate}%`}
          detail={`${conversion.offer} offer${conversion.offer === 1 ? "" : "s"} from ${conversion.interview} interview-stage roles.`}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">Where do applications stall?</h2>
        <p className="mt-1 text-sm text-stone-600">
          {stall
            ? `Longest average time is in ${statusLabels[stall.status]} (${stall.averageDays} days).`
            : "Move applications through stages to see time in each one."}
        </p>
        {stageDuration.byStatus.some((row) => row.averageDays > 0) ? (
          <ul className="mt-3 space-y-2 text-sm">
            {stageDuration.byStatus
              .filter((row) => row.averageDays > 0)
              .map((row) => (
                <li key={row.status} className="flex justify-between">
                  <Link href={`/applications?status=${row.status}`} className="hover:underline">
                    {statusLabels[row.status]}
                  </Link>
                  <span>{row.averageDays} days</span>
                </li>
              ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">Which sources lead to interviews?</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {applications.bySource.length === 0 ? (
            <li className="text-stone-600">Add a source when you create applications to compare them.</li>
          ) : (
            applications.bySource.map((row) => (
              <li key={row.source} className="flex justify-between gap-4">
                <span>{row.source}</span>
                <span className="text-stone-600">
                  {row.interviews} interview{row.interviews === 1 ? "" : "s"} / {row.count}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function Question({
  question,
  answer,
  detail,
}: {
  question: string;
  answer: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm text-stone-500">{question}</p>
      <p className="mt-2 text-2xl font-semibold">{answer}</p>
      <p className="mt-2 text-sm text-stone-600">{detail}</p>
    </div>
  );
}
