import Link from "next/link";

import { describeWhen } from "@/lib/attention";
import { interviewTypeLabels } from "@/lib/labels";
import { requireUser } from "@/server/authorization/require-user";
import { listUpcomingInterviews } from "@/server/services/interview-service";

export const metadata = { title: "Interviews" };

export default async function InterviewsPage() {
  const user = await requireUser();
  const { interviews } = await listUpcomingInterviews(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Interviews</h1>
      <p className="mt-2 text-sm text-stone-600">Upcoming scheduled interviews.</p>
      {interviews.length === 0 ? (
        <section className="card mt-8 border-dashed p-8">
          <h2 className="font-medium">No interviews scheduled</h2>
          <p className="mt-2 text-sm text-stone-600">
            Add an interview from an application detail page.
          </p>
        </section>
      ) : (
        <ul className="mt-6 space-y-3">
          {interviews.map((interview) => (
            <li key={interview.id} className="card p-5">
              <Link
                href={`/applications/${interview.applicationId}`}
                className="font-medium hover:underline"
              >
                {interview.application?.company.name} · {interview.application?.roleTitle}
              </Link>
              <p className="mt-1 text-sm text-stone-600">
                {interviewTypeLabels[interview.type]}
                {interview.scheduledAt
                  ? ` · ${describeWhen(interview.scheduledAt).label}`
                  : ""}
              </p>
              {interview.meetingUrl ? (
                <a href={interview.meetingUrl} className="mt-1 inline-block text-sm text-accent hover:underline">
                  Meeting link
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
