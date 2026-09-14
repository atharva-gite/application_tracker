import { describe, expect, it } from "vitest";

import {
  applicationDetailPath,
  applicationFilterQuery,
  hasActiveApplicationFilters,
  resetApplicationsHref,
  resolveLastActivityAt,
  shouldOpenApplicationRow,
  sortHeaderQuery,
} from "@/lib/application-list";
import { withQuery } from "@/lib/query-string";
import { parseSchema } from "@/lib/validation/helpers";
import { applicationListQuerySchema } from "@/lib/validation/application";

describe("application list helpers", () => {
  it("opens the application detail path from a row activation", () => {
    expect(applicationDetailPath("app_1")).toBe("/applications/app_1");
    expect(shouldOpenApplicationRow("Enter")).toBe(true);
    expect(shouldOpenApplicationRow(" ")).toBe(true);
    expect(shouldOpenApplicationRow("Tab")).toBe(false);
  });

  it("uses creation time when there is no later activity", () => {
    const createdAt = new Date("2026-09-10T10:00:00Z");
    expect(
      resolveLastActivityAt({
        createdAt,
        updatedAt: createdAt,
      }).toISOString(),
    ).toBe(createdAt.toISOString());
  });

  it("takes last activity from persisted history and notes", () => {
    const createdAt = new Date("2026-09-10T10:00:00Z");
    const changedAt = new Date("2026-09-12T10:00:00Z");
    const noteAt = new Date("2026-09-13T15:00:00Z");
    expect(
      resolveLastActivityAt({
        createdAt,
        updatedAt: createdAt,
        statusHistory: [{ changedAt }],
        notes: [{ createdAt: noteAt, updatedAt: noteAt }],
      }).toISOString(),
    ).toBe(noteAt.toISOString());
  });

  it("keeps filters when switching list and board views", () => {
    const query = parseSchema(applicationListQuerySchema, {
      q: "google",
      status: "INTERVIEW",
      sort: "deadline",
      order: "asc",
      view: "list",
    });
    const filters = applicationFilterQuery(query, "board");
    expect(
      withQuery("/applications", { ...filters, view: "board", page: 1 }),
    ).toBe(
      "/applications?q=google&status=INTERVIEW&sort=deadline&order=asc&view=board&page=1",
    );
    expect(
      withQuery("/applications", {
        ...applicationFilterQuery(query, "list"),
        view: "list",
        page: 1,
      }),
    ).toContain("status=INTERVIEW");
    expect(hasActiveApplicationFilters(query)).toBe(true);
    expect(resetApplicationsHref("board")).toBe("/applications?view=board");
  });

  it("toggles sort from table headers without dropping filters", () => {
    const next = sortHeaderQuery(
      { q: "intern", status: "APPLIED", view: "list", sort: "company", order: "asc" },
      "company",
    );
    expect(next).toMatchObject({
      q: "intern",
      status: "APPLIED",
      view: "list",
      sort: "company",
      order: "desc",
      page: 1,
    });
  });
});
