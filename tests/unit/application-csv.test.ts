import { describe, expect, it } from "vitest";

import {
  applicationsToCsv,
  parseApplicationCsv,
} from "@/lib/application-csv";
import { parseCsv, toCsv } from "@/lib/csv";

describe("csv", () => {
  it("round-trips quoted commas", () => {
    const csv = toCsv(["company", "role"], [['Acme, Inc.', "Intern"]]);
    expect(parseCsv(csv)).toEqual([
      ["company", "role"],
      ["Acme, Inc.", "Intern"],
    ]);
  });
});

describe("parseApplicationCsv", () => {
  it("keeps a valid row and skips a bad date", () => {
    const parsed = parseApplicationCsv(
      [
        "company,role,status,application_date,deadline,source,location,job_url",
        "Google,SWE Intern,Applied,2026-09-01,2026-10-01,Referral,London,https://careers.google.com",
        "Meta,Broken,APPLIED,not-a-date,,,,",
      ].join("\n"),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]?.input).toMatchObject({
      companyName: "Google",
      roleTitle: "SWE Intern",
      status: "APPLIED",
      applicationDate: "2026-09-01",
    });
    expect(parsed.skipped).toEqual([
      { row: 3, message: "Use a date in YYYY-MM-DD format." },
    ]);
  });

  it("rejects a file without company and role headers", () => {
    const parsed = parseApplicationCsv("name,title\nGoogle,Intern\n");
    expect(parsed).toEqual({
      ok: false,
      message: "The header row must include company and role columns.",
    });
  });
});

describe("applicationsToCsv", () => {
  it("writes the export header and status", () => {
    const csv = applicationsToCsv([
      {
        companyName: "Stripe",
        roleTitle: "Backend Intern",
        status: "APPLIED",
        applicationDate: new Date("2026-09-01T00:00:00.000Z"),
        deadline: null,
        source: "Referral",
        location: "Remote",
        jobUrl: "https://stripe.com/jobs",
      },
    ]);
    expect(csv.split("\n")[0]).toBe(
      "company,role,status,application_date,deadline,source,location,job_url",
    );
    expect(csv).toContain("Stripe,Backend Intern,APPLIED,2026-09-01,,Referral,Remote,https://stripe.com/jobs");
  });
});
