import { interviewStatusLabels, statusLabels } from "@/lib/labels";
import type { APPLICATION_STATUSES } from "@/lib/validation/application";
import type { INTERVIEW_STATUSES } from "@/lib/validation/interview";

const colors: Record<(typeof APPLICATION_STATUSES)[number], string> = {
  SAVED: "border-border bg-background text-stone-600",
  APPLIED: "border-border bg-[var(--accent-soft)] text-accent",
  ASSESSMENT: "border-[#d4d0c6] bg-[#f7f6f2] text-stone-800",
  INTERVIEW: "border-accent/20 bg-[var(--accent-soft)] text-accent",
  OFFER: "border-accent/25 bg-accent text-white",
  REJECTED: "border-[#ead7d4] bg-[#f8f1f0] text-[var(--danger)]",
  WITHDRAWN: "border-border bg-background text-stone-500",
};

export function StatusBadge({
  status,
}: {
  status: (typeof APPLICATION_STATUSES)[number];
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

const interviewColors: Record<(typeof INTERVIEW_STATUSES)[number], string> = {
  SCHEDULED: "border-accent/20 bg-[var(--accent-soft)] text-accent",
  COMPLETED: "border-border bg-background text-stone-600",
  CANCELLED: "border-border bg-background text-stone-500",
};

export function InterviewStatusBadge({
  status,
}: {
  status: (typeof INTERVIEW_STATUSES)[number];
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${interviewColors[status]}`}
    >
      {interviewStatusLabels[status]}
    </span>
  );
}
