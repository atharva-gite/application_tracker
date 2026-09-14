import { afterEach, describe, expect, it, vi } from "vitest";

import { getEmailClient, getEmailDriver, ResendEmailClient } from "@/lib/email";

describe("email client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("logs locally when Resend is not configured", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(getEmailDriver()).toBe("console");
    expect(getEmailClient().constructor.name).toBe("ConsoleEmailClient");
  });

  it("uses Resend when an API key is present", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "Folio <noreply@example.com>");
    expect(getEmailDriver()).toBe("resend");
    expect(getEmailClient()).toBeInstanceOf(ResendEmailClient);
  });

  it("posts password-reset mail to Resend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const client = new ResendEmailClient("re_test", "Folio <noreply@example.com>");
    await client.send({
      to: "student@example.com",
      subject: "Reset your Folio password",
      text: "https://example.com/reset-password?token=abc",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body.to).toEqual(["student@example.com"]);
    expect(body.subject).toContain("Reset");
    expect(JSON.stringify(init.headers)).not.toContain("student@example.com");
  });
});
