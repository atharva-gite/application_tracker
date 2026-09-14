import Link from "next/link";

import { describeWhen } from "@/lib/attention";
import { interviewTypeLabels } from "@/lib/labels";
import { requireUser } from "@/server/authorization/require-user";
import { listUserInterviews } from "@/server/services/interview-service";

export const metadata = { title: "Interviews" };

function sectionTitle(key: string) {
  if (key === "overdue") return "Overdue";
  if (key === "today") return "Today";
  if (key === "upcoming") return "Upcoming";
  return "Past";
}

export default async function InterviewsPage() {
  const user = await requireUser();
  const { interviews } = await listUserInterviews(user.id);
  const now = new Date();
  const groups = {
    overdue: [] as typeof interviews,
    today: [] as typeof interviews,
    upcoming: [] as typeof interviews,
    past: [] as typeof interviews,
  };

  for (const interview of interviews) {
    if (!interview.scheduledAt) {
      groups.upcoming.push(interview);
      continue;
    }
    if (interview.status === "COMPLETED") {
      groups.past.push(interview);
      continue;
    }
    const when = describeWhen(interview.scheduledAt, now);
    const day = new Date(interview.scheduledAt);
    const sameDay =
      day.getFullYear() === now.getFullYear() &&
      day.getMonth() === now.getMonth() &&
      day.getDate() === now.getDate();
    if (when.overdue) {
      groups.overdue.push(interview);
    } else if (sameDay) {
      groups.today.push(interview);
    } else {
      groups.upcoming.push(interview);
    }
  }

  const hasAny = interviews.length > 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Interviews</h1>
      <p className="mt-2 text-sm text-stone-600">
        Prepare for what is next, then record the outcome.
      </p>
      {!hasAny ? (
        <section className="card mt-8 border-dashed p-8">
          <h2 className="font-medium">No interviews scheduled</h2>
          <p className="mt-2 text-sm text-stone-600">
            Add an interview from an application to keep the meeting, interviewer, and prep notes together.
          </p>
        </section>
      ) : (
        <div className="mt-8 space-y-8">
          {(Object.keys(groups) as Array<keyof typeof groups>).map((key) => {
            const items = groups[key];
            if (items.length === 0) {
              return null;
            }
            return (
              <section key={key}>
                <h2 className="text-sm font-medium text-stone-500">{sectionTitle(key)}</h2>
                <ul className="mt-3 space-y-3">
                  {items.map((interview) => {
                    const when = interview.scheduledAt
                      ? describeWhen(interview.scheduledAt, now)
                      : null;
                    return (
                      <li key={interview.id} className="card p-5">
                        <Link
                          href={`/applications/${interview.applicationId}`}
                          className="font-medium hover:underline"
                        >
                          {interview.application?.company.name} · {interview.application?.roleTitle}
                        </Link>
                        <p className="mt-1 text-sm text-stone-600">
                          {interviewTypeLabels[interview.type]}
                          {when
                            ? ` · ${when.overdue && interview.status !== "COMPLETED" ? "Overdue · " : ""}${when.label}`
                            : ""}
                          {interview.interviewerName ? ` · ${interview.interviewerName}` : ""}
                        </p>
                        {interview.meetingUrl ? (
                          <a
                            href={interview.meetingUrl}
                            className="mt-1 inline-block text-sm text-accent hover:underline"
                          >
                            Meeting link
                          </a>
                        ) : null}
                        {interview.notes ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">
                            {interview.notes}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm text-stone-500">
                            Add prep notes on the application.
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
