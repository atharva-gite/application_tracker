import { afterEach, describe, expect, it, vi } from "vitest";

import { parseSentryDsn, sendSentryEvent } from "@/lib/monitoring";
import { getAppUrl } from "@/lib/env";

describe("getAppUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers AUTH_URL", () => {
    vi.stubEnv("AUTH_URL", "https://pipeline.example.com/");
    vi.stubEnv("VERCEL_URL", "pipeline-git-main.vercel.app");
    expect(getAppUrl()).toBe("https://pipeline.example.com");
  });

  it("falls back to the Vercel production host", () => {
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "pipeline.vercel.app");
    expect(getAppUrl()).toBe("https://pipeline.vercel.app");
  });
});

describe("Sentry DSN", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses a hosted DSN", () => {
    expect(
      parseSentryDsn("https://abc123@o1.ingest.sentry.io/456"),
    ).toEqual({
      key: "abc123",
      host: "o1.ingest.sentry.io",
      projectId: "456",
    });
  });

  it("rejects malformed DSNs", () => {
    expect(parseSentryDsn("not-a-dsn")).toBeNull();
  });

  it("posts events to the Sentry store endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await sendSentryEvent(
      "https://abc123@o1.ingest.sentry.io/456",
      new Error("boom"),
      { route: "/api/applications" },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://o1.ingest.sentry.io/api/456/store/");
    expect(String(init.headers && (init.headers as Record<string, string>)["X-Sentry-Auth"])).toContain(
      "abc123",
    );
    expect(String(init.body)).toContain("boom");
    expect(String(init.body)).toContain("/api/applications");
  });
});
