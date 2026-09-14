import { describe, expect, it } from "vitest";

import { withQuery } from "@/lib/query-string";

describe("withQuery", () => {
  it("builds bookmarkable application filters", () => {
    expect(
      withQuery("/applications", {
        status: "interview",
        sort: "deadline",
        q: "google",
      }),
    ).toBe("/applications?status=interview&sort=deadline&q=google");
  });

  it("omits empty filters", () => {
    expect(withQuery("/applications", { status: "", sort: undefined })).toBe(
      "/applications",
    );
  });
});
