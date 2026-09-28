import Link from "next/link";

import { describeActivity } from "@/lib/activity";

export function ActivityList({
  events,
}: {
  events: {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    metadata?: unknown;
    createdAt: string;
  }[];
}) {
  if (events.length === 0) {
    return (
      <p className="mt-3 text-sm text-stone-600">
        Status changes and new applications will show up here.
      </p>
    );
  }

  return (
    <ul className="mt-4 divide-y divide-border text-sm">
      {events.map((event) => {
        const { href, text } = describeActivity(event);
        return (
          <li key={event.id} className="flex justify-between gap-3 py-2.5 first:pt-0">
            {href ? (
              <Link href={href} className="hover:underline">
                {text}
              </Link>
            ) : (
              <span>{text}</span>
            )}
            <span className="shrink-0 text-stone-500">
              {new Date(event.createdAt).toLocaleString()}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
