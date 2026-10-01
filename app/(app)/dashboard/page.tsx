import Link from "next/link";

import { ActivityList } from "@/components/activity-list";
import { CompleteFollowUpButton } from "@/components/applications/complete-follow-up-button";
import { PageHeader } from "@/components/layout/page-header";
import { isDashboardFollowUp } from "@/lib/application-detail";
import { buildAttentionItems, isStaleApplication } from "@/lib/attention";
import { followUpTypeLabels, statusLabels } from "@/lib/labels";
import { requireUser } from "@/server/authorization/require-user";
import { getCurrentUser } from "@/server/services/auth-service";
import { getDashboard } from "@/server/services/dashboard-service";

export const metadata = { title: "Dashboard" };

const kindStyles = {
  interview: "border-accent/20 bg-[var(--accent-soft)] text-accent",
  deadline: "border-border bg-background text-stone-700",
  follow_up: "border-border bg-[#f7f6f2] text-stone-800",
  stale: "border-border bg-background text-stone-500",
} as const;

const kindLabels = {
  interview: "Interview",
  deadline: "Deadline",
  follow_up: "Follow-up",
  stale: "Stalled",
} as const;

export default async function DashboardPage() {
  const sessionUser = await requireUser();
  const user = await getCurrentUser(sessionUser.id);
  const timeZone = user.timezone;
  const data = await getDashboard(user.id);
  const now = new Date();
  const attention = buildAttentionItems(
    {
      interviews: data.upcomingInterviews.map((item) => ({
        id: item.id,
        applicationId: item.applicationId,
        scheduledAt: item.scheduledAt,
        company: item.application?.company.name ?? "Interview",
      })),
      deadlines: data.upcomingDeadlines,
      followUps: data.followUps
        .filter((item) => isDashboardFollowUp(item.dueAt, item.completedAt, now, timeZone))
        .map((item) => ({
          id: item.id,
          applicationId: item.applicationId,
          dueAt: item.dueAt,
          completedAt: item.completedAt,
          company: item.application?.company.name ?? "Application",
          typeLabel: followUpTypeLabels[item.type],
        })),
      stale: data.staleCandidates.flatMap((candidate) => {
        if (
          !candidate.lastStatusChangedAt ||
          !isStaleApplication(
            {
              status: candidate.status,
              archivedAt: null,
              lastStatusChangedAt: candidate.lastStatusChangedAt,
            },
            now,
            timeZone,
          )
        ) {
          return [];
        }
        return [
          {
            id: candidate.id,
            company: candidate.company,
            roleTitle: candidate.roleTitle,
            statusLabel: statusLabels[candidate.status],
            changedAt: candidate.lastStatusChangedAt,
          },
        ];
      }),
    },
    now,
    timeZone,
  );
  const emptySearch = data.metrics.applications === 0;
  const firstName = user.name?.trim().split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        title={<>Welcome{firstName ? `, ${firstName}` : ""}</>}
        description={
          emptySearch
            ? "Start with one role. Folio will tell you what needs attention next."
            : "What needs attention in your job search."
        }
      />

      <section>
        <h2 className="text-sm font-medium text-stone-500">Needs attention</h2>
        {emptySearch ? (
          <div className="mt-4 max-w-lg">
            <p className="text-sm leading-6 text-stone-600">
              Add a company and role to start tracking interviews, deadlines, and
              follow-ups in one place.
            </p>
            <Link href="/applications/new" className="btn-primary mt-4">
              Add your first application
            </Link>
          </div>
        ) : attention.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Nothing is due, and no application has gone quiet. Schedule an interview
            or follow-up when you have a next step.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {attention.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 py-3.5 text-sm"
              >
                <div>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${kindStyles[item.kind]}`}
                  >
                    {kindLabels[item.kind]}
                  </span>
                  <div className="mt-1.5">
                    <Link href={item.href} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                    <span
                      className={item.relative.overdue ? "text-[var(--danger)]" : "text-stone-500"}
                    >
                      {" "}
                      · {item.relative.overdue ? "Overdue" : item.relative.label}
                      {item.relative.overdue ? ` · ${item.relative.label}` : ""}
                    </span>
                  </div>
                </div>
                {item.followUp ? (
                  <CompleteFollowUpButton
                    followUpId={item.followUp.followUpId}
                    applicationId={item.followUp.applicationId}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!emptySearch ? (
        <section className="border-y border-border py-6">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <Metric href="/applications" label="Active" value={data.metrics.active} />
            <Metric href="/interviews" label="Interviews" value={data.metrics.interviews} />
            <Metric href="/applications?status=OFFER" label="Offers" value={data.metrics.offers} />
          </div>
          <div className="mt-6 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium text-stone-500">Stages</h2>
            <Link href="/applications?view=board" className="text-sm font-medium text-accent">
              Open board
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {Object.entries(data.pipeline).map(([status, count]) => (
              <Link
                key={status}
                href={`/applications?status=${status}&view=board`}
                className="min-w-[4.5rem]"
              >
                <p className="text-lg font-semibold tracking-tight">{count}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {statusLabels[status as keyof typeof statusLabels]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-sm font-medium text-stone-500">Recent activity</h2>
        <ActivityList events={data.activity} />
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="min-w-[5rem]">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p>
    </Link>
  );
}
