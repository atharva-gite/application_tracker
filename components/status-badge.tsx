import { statusLabels } from "@/lib/labels";
import type { APPLICATION_STATUSES } from "@/lib/validation/application";

const colors: Record<(typeof APPLICATION_STATUSES)[number], string> = {
  SAVED: "bg-[var(--accent-soft)] text-accent ring-transparent",
  APPLIED: "bg-sky-50 text-sky-900 ring-sky-100",
  ASSESSMENT: "bg-amber-50 text-amber-900 ring-amber-100",
  INTERVIEW: "bg-indigo-50 text-indigo-900 ring-indigo-100",
  OFFER: "bg-emerald-50 text-emerald-900 ring-emerald-100",
  REJECTED: "bg-red-50 text-red-800 ring-red-100",
  WITHDRAWN: "bg-stone-100 text-stone-500 ring-stone-200",
};

export function StatusBadge({
  status,
}: {
  status: (typeof APPLICATION_STATUSES)[number];
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${colors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
