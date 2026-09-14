import { describe, expect, it } from "vitest";

import { describeActivity } from "@/lib/activity";

describe("describeActivity", () => {
  it("explains status changes", () => {
    expect(
      describeActivity({
        entityType: "application",
        entityId: "app_1",
        action: "status_changed",
        metadata: { fromStatus: "APPLIED", toStatus: "INTERVIEW" },
      }),
    ).toEqual({
      href: "/applications/app_1",
      text: "Moved from Applied to Interview",
    });
  });

  it("explains created applications", () => {
    expect(
      describeActivity({
        entityType: "application",
        entityId: "app_2",
        action: "created",
      }),
    ).toEqual({
      href: "/applications/app_2",
      text: "Added an application",
    });
  });
});
