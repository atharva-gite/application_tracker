import Link from "next/link";

import { JoinInterviewLink } from "@/components/interviews/join-interview-link";
import { InterviewStatusBadge } from "@/components/status-badge";
import {
  groupInterviews,
  interviewGroupTitles,
  INTERVIEW_GROUP_ORDER,
  interviewHref,
  interviewTypeLabel,
  interviewWhenLabel,
} from "@/lib/interviews";
import { requireUser } from "@/server/authorization/require-user";
import { listUserInterviews } from "@/server/services/interview-service";

export const metadata = { title: "Interviews" };

export default async function InterviewsPage() {
  const user = await requireUser();
  const { interviews } = await listUserInterviews(user.id);
  const now = new Date();
  const groups = groupInterviews(interviews, now);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Interviews</h1>
      <p className="mt-2 text-sm text-stone-600">
        Prepare for what is next, then record the outcome.
      </p>
      {interviews.length === 0 ? (
        <section className="card mt-8 border-dashed p-8">
          <h2 className="font-medium">No interviews scheduled</h2>
          <p className="mt-2 text-sm text-stone-600">
            Add an interview from an application to keep the meeting, interviewer, and
            prep notes together.
          </p>
          <Link href="/applications" className="btn-primary mt-4">
            Open applications
          </Link>
        </section>
      ) : (
        <div className="mt-8 space-y-8">
          {INTERVIEW_GROUP_ORDER.map((key) => {
            const items = groups[key];
            if (items.length === 0) {
              return null;
            }
            return (
              <section key={key}>
                <h2 className="text-sm font-medium text-stone-500">
                  {interviewGroupTitles[key]}
                </h2>
                <ul className="mt-3 space-y-3">
                  {items.map((interview) => {
                    const when = interviewWhenLabel(interview, now);
                    const company = interview.application?.company.name ?? "Company";
                    const role = interview.application?.roleTitle ?? "Role";
                    return (
                      <li key={interview.id} className="card p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <Link
                              href={interviewHref(interview.id)}
                              className="font-medium hover:underline"
                            >
                              {company}
                            </Link>
                            <p className="mt-1 text-sm text-stone-600">{role}</p>
                          </div>
                          <InterviewStatusBadge status={interview.status} />
                        </div>
                        <p className="mt-3 text-sm text-stone-600">
                          {interviewTypeLabel(interview.type)}
                          {" · "}
                          <span className={when.overdue ? "text-[var(--danger)]" : undefined}>
                            {when.label}
                          </span>
                          {interview.interviewerName
                            ? ` · ${interview.interviewerName}`
                            : ""}
                        </p>
                        {interview.meetingUrl ? (
                          <div className="mt-2">
                            <JoinInterviewLink href={interview.meetingUrl} />
                          </div>
                        ) : null}
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
