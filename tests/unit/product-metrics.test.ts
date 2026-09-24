import { describe, expect, it } from "vitest";

import { PRODUCT_EVENTS } from "@/lib/product-events";
import { activationRate, weeklyActiveManagers } from "@/lib/product-metrics";

const day = (iso: string) => new Date(iso);

describe("activationRate", () => {
  it("counts signups with three applications inside the first seven days", () => {
    const result = activationRate([
      { userId: "a", name: PRODUCT_EVENTS.signupCompleted, createdAt: day("2026-09-01T00:00:00Z") },
      { userId: "a", name: PRODUCT_EVENTS.applicationCreated, createdAt: day("2026-09-02T00:00:00Z") },
      { userId: "a", name: PRODUCT_EVENTS.applicationCreated, createdAt: day("2026-09-03T00:00:00Z") },
      { userId: "a", name: PRODUCT_EVENTS.applicationCreated, createdAt: day("2026-09-08T00:00:00Z") },
      { userId: "a", name: PRODUCT_EVENTS.applicationCreated, createdAt: day("2026-09-09T00:00:00Z") },
      { userId: "b", name: PRODUCT_EVENTS.signupCompleted, createdAt: day("2026-09-01T00:00:00Z") },
      { userId: "b", name: PRODUCT_EVENTS.applicationCreated, createdAt: day("2026-09-02T00:00:00Z") },
    ]);

    expect(result).toEqual({ activated: 1, signups: 2, rate: 0.5 });
  });

  it("is zero when nobody has signed up", () => {
    expect(activationRate([])).toEqual({ activated: 0, signups: 0, rate: 0 });
  });
});

describe("weeklyActiveManagers", () => {
  it("counts users with an active application and a management event this week", () => {
    const now = day("2026-09-14T12:00:00Z");
    const count = weeklyActiveManagers({
      now,
      activeUserIds: ["a", "b"],
      events: [
        { userId: "a", name: PRODUCT_EVENTS.applicationCreated, createdAt: day("2026-09-10T12:00:00Z") },
        { userId: "b", name: PRODUCT_EVENTS.signupCompleted, createdAt: day("2026-09-13T12:00:00Z") },
        { userId: "c", name: PRODUCT_EVENTS.interviewCreated, createdAt: day("2026-09-13T12:00:00Z") },
        { userId: "a", name: PRODUCT_EVENTS.followUpCompleted, createdAt: day("2026-09-01T12:00:00Z") },
      ],
    });
    expect(count).toBe(1);
  });
});
