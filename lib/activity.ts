import { statusLabels } from "@/lib/labels";
import type { APPLICATION_STATUSES } from "@/lib/validation/application";

type Status = (typeof APPLICATION_STATUSES)[number];

function isStatus(value: unknown): value is Status {
  return typeof value === "string" && value in statusLabels;
}

function metadataRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export function describeActivity(event: {
  entityType: string;
  entityId: string;
  action: string;
  metadata?: unknown;
}) {
  const metadata = metadataRecord(event.metadata);
  const href =
    event.entityType === "application" ? `/applications/${event.entityId}` : undefined;

  if (event.action === "created") {
    return { href, text: "Added an application" };
  }
  if (event.action === "archived") {
    return { href, text: "Archived an application" };
  }
  if (event.action === "status_changed") {
    const from = isStatus(metadata.fromStatus)
      ? statusLabels[metadata.fromStatus]
      : null;
    const to = isStatus(metadata.toStatus)
      ? statusLabels[metadata.toStatus]
      : null;
    if (from && to) {
      return { href, text: `Moved from ${from} to ${to}` };
    }
    if (to) {
      return { href, text: `Moved to ${to}` };
    }
  }
  if (event.action === "updated") {
    return { href, text: "Updated an application" };
  }

  return {
    href,
    text: `${event.entityType} ${event.action}`.replaceAll("_", " "),
  };
}
