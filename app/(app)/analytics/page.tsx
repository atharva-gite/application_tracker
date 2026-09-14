import { ActivityList } from "@/components/activity-list";
import { statusLabels } from "@/lib/labels";
import { requireUser } from "@/server/authorization/require-user";
import {
  getAnalyticsActivity,
  getAnalyticsApplications,
  getAnalyticsConversion,
  getAnalyticsOverview,
  getAnalyticsStageDuration,
} from "@/server/services/dashboard-service";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [overview, applications, conversion, activity, stageDuration] =
    await Promise.all([
      getAnalyticsOverview(user.id),
      getAnalyticsApplications(user.id),
      getAnalyticsConversion(user.id),
      getAnalyticsActivity(user.id),
      getAnalyticsStageDuration(user.id),
    ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-stone-600">
          Conversion and activity for your current search.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Card label="Applied" value={overview.applied} />
        <Card label="Interviews" value={overview.interviews} />
        <Card
          label="App → interview"
          value={`${Math.round(conversion.applicationToInterview * 100)}%`}
        />
        <Card
          label="Interview → offer"
          value={`${Math.round(conversion.interviewToOffer * 100)}%`}
        />
      </div>
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">By stage</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {applications.byStatus.length === 0 ? (
            <li className="text-stone-600">No applications yet.</li>
          ) : (
            applications.byStatus.map((row) => (
              <li key={row.status} className="flex justify-between">
                <span>{statusLabels[row.status]}</span>
                <span>{row.count}</span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">Average days in stage</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {stageDuration.byStatus.every((row) => row.averageDays === 0) ? (
            <li className="text-stone-600">Move applications through stages to see this.</li>
          ) : (
            stageDuration.byStatus.map((row) => (
              <li key={row.status} className="flex justify-between">
                <span>{statusLabels[row.status]}</span>
                <span>{row.averageDays}</span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">By source</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {applications.bySource.length === 0 ? (
            <li className="text-stone-600">No applications yet.</li>
          ) : (
            applications.bySource.map((row) => (
              <li key={row.source} className="flex justify-between">
                <span>{row.source}</span>
                <span>{row.count}</span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-medium">Recent activity</h2>
        <ActivityList events={activity.activity} />
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
