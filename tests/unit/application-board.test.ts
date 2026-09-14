import { describe, expect, it, vi } from "vitest";

import {
  boardCardHref,
  columnCountLabel,
  failedBoardMoveMessage,
  groupApplicationsByStatus,
  moveApplicationOnBoard,
  parseBoardDrag,
  persistApplicationStatus,
  prepareBoardStatusMove,
  sameApplicationDataset,
  serializeBoardDrag,
  type BoardApplication,
} from "@/lib/application-board";
import { applicationFilterQuery } from "@/lib/application-list";
import { withQuery } from "@/lib/query-string";
import {
  APPLICATION_STATUSES,
  isAllowedApplicationStatusTransition,
} from "@/lib/validation/application";

function app(
  overrides: Partial<BoardApplication> & Pick<BoardApplication, "id" | "status">,
): BoardApplication {
  return {
    company: { name: "Stripe" },
    roleTitle: "Software Engineering Intern",
    ...overrides,
  };
}

const dataset: BoardApplication[] = [
  app({ id: "saved-1", status: "SAVED", company: { name: "Notion" } }),
  app({
    id: "interview-1",
    status: "INTERVIEW",
    deadline: "2026-09-15",
    lastActivityAt: "2026-09-12T12:00:00.000Z",
  }),
  app({ id: "interview-2", status: "INTERVIEW", company: { name: "Google" } }),
  app({ id: "offer-1", status: "OFFER", company: { name: "Meta" } }),
];

describe("application board grouping", () => {
  it("groups the same filtered dataset by current stage with correct counts", () => {
    const columns = groupApplicationsByStatus(dataset);
    expect(columns.map((column) => column.status)).toEqual([...APPLICATION_STATUSES]);
    expect(columns.map((column) => column.count)).toEqual([1, 0, 0, 2, 1, 0, 0]);
    expect(columns.find((column) => column.status === "INTERVIEW")?.applications.map((item) => item.id)).toEqual(
      ["interview-1", "interview-2"],
    );
    expect(sameApplicationDataset(dataset, columns.flatMap((column) => column.applications))).toBe(
      true,
    );
  });

  it("keeps empty stages visible", () => {
    const withdrawn = groupApplicationsByStatus([]).find(
      (column) => column.status === "WITHDRAWN",
    );
    expect(withdrawn).toMatchObject({
      status: "WITHDRAWN",
      count: 0,
      applications: [],
    });
    expect(columnCountLabel(0)).toBe("0 applications");
    expect(columnCountLabel(1)).toBe("1 application");
    expect(columnCountLabel(4)).toBe("4 applications");
  });

  it("opens the matching application detail from a card", () => {
    expect(boardCardHref("interview-1")).toBe("/applications/interview-1");
  });

  it("preserves list filters when switching to the board", () => {
    const href = withQuery("/applications", {
      ...applicationFilterQuery(
        {
          page: 1,
          pageSize: 20,
          q: "Stripe",
          status: "INTERVIEW",
          due: "today",
          view: "list",
        },
        "board",
      ),
      view: "board",
      page: 1,
    });
    expect(href).toContain("q=Stripe");
    expect(href).toContain("status=INTERVIEW");
    expect(href).toContain("due=today");
    expect(href).toContain("view=board");
  });
});

describe("application board status moves", () => {
  it("allows any valid stage transition", () => {
    expect(isAllowedApplicationStatusTransition("SAVED", "APPLIED")).toBe(true);
    expect(isAllowedApplicationStatusTransition("INTERVIEW", "REJECTED")).toBe(true);
    expect(isAllowedApplicationStatusTransition("OFFER", "SAVED")).toBe(true);
  });

  it("rejects invalid drop targets before mutating", () => {
    expect(
      prepareBoardStatusMove({
        applications: dataset,
        pendingIds: [],
        applicationId: "interview-1",
        toStatus: "HIRED",
      }),
    ).toEqual({ kind: "invalid", error: "That stage is not valid." });
  });

  it("prevents duplicate in-flight moves for the same card", () => {
    expect(
      prepareBoardStatusMove({
        applications: dataset,
        pendingIds: ["interview-1"],
        applicationId: "interview-1",
        toStatus: "OFFER",
      }),
    ).toEqual({ kind: "ignore" });
  });

  it("optimistically moves a card and restores the previous columns on failure", () => {
    const prepared = prepareBoardStatusMove({
      applications: dataset,
      pendingIds: [],
      applicationId: "interview-1",
      toStatus: "OFFER",
    });
    expect(prepared.kind).toBe("move");
    if (prepared.kind !== "move") {
      return;
    }
    expect(
      prepared.optimistic.find((item) => item.id === "interview-1")?.status,
    ).toBe("OFFER");
    expect(groupApplicationsByStatus(prepared.optimistic).find((column) => column.status === "INTERVIEW")?.count).toBe(
      1,
    );
    expect(groupApplicationsByStatus(prepared.previous)).toEqual(
      groupApplicationsByStatus(dataset),
    );
    expect(failedBoardMoveMessage(new Error("You need to sign in to continue."))).toBe(
      "You need to sign in to continue. The card was moved back.",
    );
  });

  it("serializes drag payloads for valid stages only", () => {
    const payload = serializeBoardDrag({ id: "saved-1", status: "SAVED" });
    expect(parseBoardDrag(payload)).toEqual({ id: "saved-1", status: "SAVED" });
    expect(parseBoardDrag("not-json")).toBeNull();
    expect(parseBoardDrag('{"id":"saved-1","status":"HIRED"}')).toBeNull();
  });

  it("persists the new stage through the status API", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ application: { id: "interview-1", status: "OFFER" } }),
    });
    await persistApplicationStatus("interview-1", "OFFER", fetchImpl);
    expect(fetchImpl).toHaveBeenCalledWith("/api/applications/interview-1/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "OFFER" }),
    });
  });

  it("surfaces API failures so the board can roll back", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: { message: "Application not found." },
      }),
    });
    await expect(
      persistApplicationStatus("app-b", "REJECTED", fetchImpl),
    ).rejects.toThrow("Application not found.");
  });

  it("keeps other cards in place when one application moves", () => {
    const next = moveApplicationOnBoard(dataset, "saved-1", "APPLIED");
    expect(next.find((item) => item.id === "offer-1")?.status).toBe("OFFER");
    expect(next.find((item) => item.id === "saved-1")?.status).toBe("APPLIED");
  });
});
