"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";

import {
  BOARD_DRAG_MIME,
  boardCardHref,
  columnCountLabel,
  failedBoardMoveMessage,
  groupApplicationsByStatus,
  parseBoardDrag,
  persistApplicationStatus,
  prepareBoardStatusMove,
  serializeBoardDrag,
  terminalStageConfirmMessage,
  type BoardApplication,
} from "@/lib/application-board";
import { deadlineToneClass, describeDeadline, describePast } from "@/lib/attention";
import { statusLabels } from "@/lib/labels";
import { APPLICATION_STATUSES, type ApplicationStatusValue } from "@/lib/validation/application";

export function ApplicationBoard({
  applications,
}: {
  applications: BoardApplication[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(applications);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<{
    id: string;
    toStatus: ApplicationStatusValue;
  } | null>(null);
  const [overStatus, setOverStatus] = useState<ApplicationStatusValue | null>(null);
  const dragged = useRef(false);
  const itemsRef = useRef(items);
  const pendingRef = useRef<Set<string>>(new Set());

  async function moveCard(applicationId: string, toStatus: string) {
    const prepared = prepareBoardStatusMove({
      applications: itemsRef.current,
      pendingIds: pendingRef.current,
      applicationId,
      toStatus,
    });
    if (prepared.kind === "ignore") {
      return;
    }
    if (prepared.kind === "invalid") {
      setError(prepared.error);
      setRetry(null);
      return;
    }

    const confirmMessage = terminalStageConfirmMessage(prepared.toStatus);
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    pendingRef.current = new Set(prepared.pendingIds);
    itemsRef.current = prepared.optimistic;
    setPendingIds(prepared.pendingIds);
    setItems(prepared.optimistic);
    setError(null);
    setRetry(null);

    try {
      await persistApplicationStatus(applicationId, prepared.toStatus);
      pendingRef.current.delete(applicationId);
      setPendingIds([...pendingRef.current]);
      router.refresh();
    } catch (cause) {
      pendingRef.current.delete(applicationId);
      itemsRef.current = prepared.previous;
      setPendingIds([...pendingRef.current]);
      setItems(prepared.previous);
      setError(failedBoardMoveMessage(cause));
      setRetry({ id: applicationId, toStatus: prepared.toStatus });
    }
  }

  const columns = groupApplicationsByStatus(items);

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 border-l-[3px] border-[var(--danger)] pl-3 text-sm"
        >
          <p className="text-stone-700">{error}</p>
          {retry ? (
            <button
              type="button"
              className="text-sm font-medium text-accent"
              onClick={() => moveCard(retry.id, retry.toStatus)}
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto pb-4">
        <div className="flex w-max gap-3">
          {columns.map((column) => (
            <section
              key={column.status}
              aria-label={`${column.label}, ${columnCountLabel(column.count)}`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverStatus(column.status);
              }}
              onDragLeave={() => {
                setOverStatus((current) =>
                  current === column.status ? null : current,
                );
              }}
              onDrop={(event) => {
                event.preventDefault();
                setOverStatus(null);
                const payload = parseBoardDrag(
                  event.dataTransfer.getData(BOARD_DRAG_MIME),
                );
                if (!payload) {
                  setError("That stage is not valid.");
                  return;
                }
                void moveCard(payload.id, column.status);
              }}
              className={`flex w-[16.5rem] shrink-0 flex-col p-2.5 ${
                overStatus === column.status
                  ? "bg-[var(--accent-soft)]"
                  : "inset"
              }`}
            >
              <header className="mb-3 px-1">
                <p className="text-sm font-medium text-stone-700">{column.label}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {columnCountLabel(column.count)}
                </p>
              </header>
              <div className="flex min-h-[8rem] flex-1 flex-col gap-2">
                {column.applications.map((item) => (
                  <BoardCard
                    key={item.id}
                    application={item}
                    pending={pendingIds.includes(item.id)}
                    onMove={(status) => moveCard(item.id, status)}
                    onDragBegin={() => {
                      dragged.current = true;
                    }}
                    onDragEnd={() => {
                      setOverStatus(null);
                      window.setTimeout(() => {
                        dragged.current = false;
                      }, 0);
                    }}
                    suppressClick={() => dragged.current}
                  />
                ))}
                {column.applications.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-stone-400">
                    Drop an application here
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardCard({
  application,
  pending,
  onMove,
  onDragBegin,
  onDragEnd,
  suppressClick,
}: {
  application: BoardApplication;
  pending: boolean;
  onMove: (status: ApplicationStatusValue) => void;
  onDragBegin: () => void;
  onDragEnd: () => void;
  suppressClick: () => boolean;
}) {
  const due = describeDeadline(application.deadline);
  const activity =
    application.lastActivityAt ??
    application.updatedAt ??
    application.createdAt;

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    onDragBegin();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      BOARD_DRAG_MIME,
      serializeBoardDrag(application),
    );
  }

  return (
    <div
      draggable={!pending}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      aria-disabled={pending}
      className={`border border-border bg-background p-3 ${
        pending ? "pointer-events-none opacity-60" : "hover:border-stone-300"
      }`}
    >
      <Link
        href={boardCardHref(application.id)}
        onClick={(event) => {
          if (suppressClick()) {
            event.preventDefault();
          }
        }}
        className="block"
      >
        <p className="text-sm font-medium">{application.company.name}</p>
        <p className="text-sm text-stone-600">{application.roleTitle}</p>
      </Link>
      <label className="mt-2 block">
        <span className="sr-only">
          Stage for {application.company.name} {application.roleTitle}
        </span>
        <select
          value={application.status}
          disabled={pending}
          className="input py-1 text-xs"
          onChange={(event) => onMove(event.target.value as ApplicationStatusValue)}
        >
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      {due.kind !== "none" ? (
        <p className={`mt-2 text-xs ${deadlineToneClass(due.kind)}`}>{due.label}</p>
      ) : null}
      {activity ? (
        <p className="mt-0.5 text-xs text-stone-500">{describePast(activity)}</p>
      ) : null}
    </div>
  );
}
