import { statusLabels } from "@/lib/labels";
import type { APPLICATION_STATUSES } from "@/lib/validation/application";

const colors: Record<(typeof APPLICATION_STATUSES)[number], string> = {
  SAVED: "bg-stone-100 text-stone-700 ring-stone-200",
  APPLIED: "bg-blue-50 text-blue-800 ring-blue-100",
  ASSESSMENT: "bg-amber-50 text-amber-800 ring-amber-100",
  INTERVIEW: "bg-violet-50 text-violet-800 ring-violet-100",
  OFFER: "bg-emerald-50 text-emerald-800 ring-emerald-100",
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
