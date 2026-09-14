import { applicationDetailPath } from "@/lib/application-list";
import { statusLabels } from "@/lib/labels";
import {
  APPLICATION_STATUSES,
  isAllowedApplicationStatusTransition,
  isApplicationStatus,
  type ApplicationStatusValue,
} from "@/lib/validation/application";

export const BOARD_DRAG_MIME = "text/plain";

export type BoardApplication = {
  id: string;
  company: { name: string };
  roleTitle: string;
  status: ApplicationStatusValue;
  location?: string | null;
  source?: string | null;
  deadline?: string | null;
  lastActivityAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type BoardColumn = {
  status: ApplicationStatusValue;
  label: string;
  count: number;
  applications: BoardApplication[];
};

export function groupApplicationsByStatus(
  applications: BoardApplication[],
): BoardColumn[] {
  return APPLICATION_STATUSES.map((status) => {
    const items = applications.filter((item) => item.status === status);
    return {
      status,
      label: statusLabels[status],
      count: items.length,
      applications: items,
    };
  });
}

export function sameApplicationDataset(
  list: Array<{ id: string }>,
  board: Array<{ id: string }>,
) {
  if (list.length !== board.length) {
    return false;
  }
  const boardIds = new Set(board.map((item) => item.id));
  return list.every((item) => boardIds.has(item.id));
}

export function columnCountLabel(count: number) {
  return count === 1 ? "1 application" : `${count} applications`;
}

export function boardCardHref(id: string) {
  return applicationDetailPath(id);
}

export function serializeBoardDrag(application: {
  id: string;
  status: ApplicationStatusValue;
}) {
  return JSON.stringify({ id: application.id, status: application.status });
}

export function parseBoardDrag(data: string | null | undefined) {
  if (!data) {
    return null;
  }
  try {
    const parsed = JSON.parse(data) as { id?: unknown; status?: unknown };
    if (typeof parsed.id !== "string" || !isApplicationStatus(parsed.status)) {
      return null;
    }
    return { id: parsed.id, status: parsed.status };
  } catch {
    return null;
  }
}

export function moveApplicationOnBoard(
  applications: BoardApplication[],
  id: string,
  toStatus: ApplicationStatusValue,
): BoardApplication[] {
  return applications.map((item) =>
    item.id === id ? { ...item, status: toStatus } : item,
  );
}

export async function persistApplicationStatus(
  id: string,
  status: ApplicationStatusValue,
  fetchImpl: typeof fetch = fetch,
) {
  const response = await fetchImpl(`/api/applications/${id}/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const body = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? "Could not update the application stage.",
    );
  }
}

export function failedBoardMoveMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Could not update the application stage.";
  return `${message} The card was moved back.`;
}

export function prepareBoardStatusMove(input: {
  applications: BoardApplication[];
  pendingIds: Iterable<string>;
  applicationId: string;
  toStatus: string;
}):
  | { kind: "ignore" }
  | { kind: "invalid"; error: string }
  | {
      kind: "move";
      fromStatus: ApplicationStatusValue;
      toStatus: ApplicationStatusValue;
      previous: BoardApplication[];
      optimistic: BoardApplication[];
      pendingIds: string[];
    } {
  const pending = new Set(input.pendingIds);
  if (pending.has(input.applicationId)) {
    return { kind: "ignore" };
  }

  if (!isApplicationStatus(input.toStatus)) {
    return { kind: "invalid", error: "That stage is not valid." };
  }

  const current = input.applications.find((item) => item.id === input.applicationId);
  if (!current) {
    return { kind: "invalid", error: "That application is no longer on the board." };
  }

  if (current.status === input.toStatus) {
    return { kind: "ignore" };
  }

  if (!isAllowedApplicationStatusTransition(current.status, input.toStatus)) {
    return { kind: "invalid", error: "That stage change is not allowed." };
  }

  pending.add(input.applicationId);
  return {
    kind: "move",
    fromStatus: current.status,
    toStatus: input.toStatus,
    previous: input.applications,
    optimistic: moveApplicationOnBoard(
      input.applications,
      input.applicationId,
      input.toStatus,
    ),
    pendingIds: [...pending],
  };
}
