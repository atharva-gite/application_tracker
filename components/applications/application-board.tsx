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
  type BoardApplication,
} from "@/lib/application-board";
import { deadlineToneClass, describeDeadline, describePast } from "@/lib/attention";
import { statusLabels } from "@/lib/labels";
import type { ApplicationStatusValue } from "@/lib/validation/application";

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
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-border"
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
              className={`flex w-[17rem] shrink-0 flex-col rounded-2xl p-3 ring-1 ${
                overStatus === column.status
                  ? "bg-[var(--accent-soft)] ring-accent/20"
                  : "bg-[#f7f6f2] ring-border"
              }`}
            >
              <header className="mb-3 px-1">
                <p className="text-xs font-semibold tracking-[0.14em] text-stone-500">
                  {column.label.toUpperCase()}
                </p>
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
                  <p className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-sm text-stone-400">
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
  onDragBegin,
  onDragEnd,
  suppressClick,
}: {
  application: BoardApplication;
  pending: boolean;
  onDragBegin: () => void;
  onDragEnd: () => void;
  suppressClick: () => boolean;
}) {
  const due = describeDeadline(application.deadline);
  const activity =
    application.lastActivityAt ??
    application.updatedAt ??
    application.createdAt;
  const extras = [application.location, application.source].filter(Boolean);

  function handleDragStart(event: DragEvent<HTMLAnchorElement>) {
    onDragBegin();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      BOARD_DRAG_MIME,
      serializeBoardDrag(application),
    );
  }

  return (
    <Link
      href={boardCardHref(application.id)}
      draggable={!pending}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={(event) => {
        if (suppressClick()) {
          event.preventDefault();
        }
      }}
      aria-disabled={pending}
      className={`block rounded-xl bg-white p-3 ring-1 ring-border hover:ring-stone-300 ${
        pending ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <p className="text-sm font-medium">{application.company.name}</p>
      <p className="text-sm text-stone-600">{application.roleTitle}</p>
      <p className="mt-2 text-xs text-stone-500">
        {statusLabels[application.status]}
      </p>
      {due.kind !== "none" ? (
        <p className={`mt-2 text-xs ${deadlineToneClass(due.kind)}`}>
          Deadline: {due.label}
        </p>
      ) : null}
      {activity ? (
        <p className="mt-0.5 text-xs text-stone-500">
          Last activity: {describePast(activity)}
        </p>
      ) : null}
      {extras.length > 0 ? (
        <p className="mt-1 text-xs text-stone-400">{extras.join(" · ")}</p>
      ) : null}
    </Link>
  );
}
