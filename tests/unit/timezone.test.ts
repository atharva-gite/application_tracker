import { describe, expect, it } from "vitest";

import {
  calendarDateInZone,
  fromZonedDateTime,
  resolveTimeZone,
} from "@/lib/timezone";

describe("timezone helpers", () => {
  it("treats naive due times as wall clock in the user timezone", () => {
    expect(fromZonedDateTime("2026-09-15T08:00", "Asia/Tokyo").toISOString()).toBe(
      "2026-09-14T23:00:00.000Z",
    );
    expect(fromZonedDateTime("2026-09-14T23:00:00.000Z", "Asia/Tokyo").toISOString()).toBe(
      "2026-09-14T23:00:00.000Z",
    );
  });

  it("computes calendar dates in the user timezone", () => {
    const instant = new Date("2026-09-14T23:00:00.000Z");
    expect(calendarDateInZone(instant, "UTC")).toBe("2026-09-14");
    expect(calendarDateInZone(instant, "Asia/Tokyo")).toBe("2026-09-15");
  });

  it("falls back to UTC for invalid timezones", () => {
    expect(resolveTimeZone("Not/A_Zone")).toBe("UTC");
  });
});
