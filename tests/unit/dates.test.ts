import { describe, expect, it } from "vitest";

import { formatDateOnly, toDateOnly } from "@/lib/domain";
import { AppError } from "@/lib/errors";
import { parseSchema } from "@/lib/validation/helpers";
import { dateOnlySchema, dateTimeSchema, paginationSchema } from "@/lib/validation/helpers";
import { applicationListQuerySchema } from "@/lib/validation/application";
import { analyticsQuerySchema } from "@/lib/validation/analytics";

describe("dates", () => {
  it("stores date-only values at UTC midnight", () => {
    expect(toDateOnly("2026-09-18").toISOString()).toBe("2026-09-18T00:00:00.000Z");
    expect(formatDateOnly(toDateOnly("2026-09-18"))).toBe("2026-09-18");
  });

  it("accepts deadline dates in the past, today, and tomorrow", () => {
    expect(parseSchema(dateOnlySchema, "2020-01-01")).toBe("2020-01-01");
    expect(parseSchema(dateOnlySchema, "2026-09-14")).toBe("2026-09-14");
    expect(parseSchema(dateOnlySchema, "2026-09-15")).toBe("2026-09-15");
  });

  it("rejects malformed dates", () => {
    expect(() => parseSchema(dateOnlySchema, "09/18/2026")).toThrow(AppError);
  });

  it("accepts datetime-local interview times", () => {
    const value = parseSchema(dateTimeSchema, "2026-09-17T15:30");
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe("pagination", () => {
  it("defaults page and page size", () => {
    expect(parseSchema(paginationSchema, {})).toEqual({ page: 1, pageSize: 20 });
  });

  it("rejects oversized pages", () => {
    expect(() => parseSchema(paginationSchema, { pageSize: 101 })).toThrow(AppError);
  });

  it("accepts application list search, due, and last-activity sort", () => {
    expect(
      parseSchema(applicationListQuerySchema, {
        q: "Google",
        status: "INTERVIEW",
        due: "today",
        sort: "lastActivity",
        order: "desc",
      }),
    ).toMatchObject({
      q: "Google",
      status: "INTERVIEW",
      due: "today",
      sort: "lastActivity",
      page: 1,
      pageSize: 20,
    });
  });
});

describe("analytics query", () => {
  it("defaults to all time", () => {
    expect(parseSchema(analyticsQuerySchema, {})).toEqual({ range: "all" });
  });

  it("accepts simple windows", () => {
    expect(parseSchema(analyticsQuerySchema, { range: "30" })).toEqual({
      range: "30",
    });
  });

  it("rejects unknown ranges", () => {
    expect(() => parseSchema(analyticsQuerySchema, { range: "year" })).toThrow(
      AppError,
    );
  });
});
