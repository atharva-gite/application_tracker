import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { PRODUCT_EVENTS } from "@/lib/product-events";
import {
  exportApplicationsCsv,
  importApplications,
} from "@/server/services/application-csv-service";
import { createTestApplication, createTestUser, ensureDatabase } from "@/tests/helpers/db";

const header =
  "company,role,status,application_date,deadline,source,location,job_url";

describe("application csv import", () => {
  it("dedupes companies, keeps valid rows, and stays inside the caller", async (context) => {
    await ensureDatabase(context);
    const owner = await createTestUser("CSV Owner");
    const other = await createTestUser("CSV Other");
    await createTestApplication(owner.id, {
      companyName: "Existing",
      roleTitle: "Already tracked",
    });
    const before = await prisma.application.count({ where: { userId: owner.id } });

    const imported = await importApplications(
      other.id,
      [
        header,
        "Google,Role A,SAVED,2026-09-01,2026-10-01,Referral,London,https://careers.google.com",
        "google,Role B,APPLIED,2026-09-02,,,,",
        "Meta,Broken,APPLIED,not-a-date,,,,",
      ].join("\n"),
    );

    expect(imported.created).toBe(2);
    expect(imported.skipped).toEqual([
      { row: 4, message: "Use a date in YYYY-MM-DD format." },
    ]);
    expect(await prisma.application.count({ where: { userId: owner.id } })).toBe(before);

    const companies = await prisma.company.findMany({
      where: { userId: other.id, normalizedName: "google" },
    });
    expect(companies).toHaveLength(1);
    expect(
      await prisma.application.count({
        where: { userId: other.id, companyId: companies[0]?.id },
      }),
    ).toBe(2);

    const history = await prisma.applicationStatusHistory.findMany({
      where: { application: { userId: other.id } },
    });
    expect(history).toHaveLength(2);

    const events = await prisma.productEvent.findMany({
      where: { userId: other.id, name: PRODUCT_EVENTS.csvImported },
    });
    expect(events).toHaveLength(1);

    const csv = await exportApplicationsCsv(other.id);
    expect(csv).toContain("Google,Role A,SAVED");
    expect(csv).toContain("Google,Role B,APPLIED");
    expect(csv).not.toContain("Already tracked");
    const ownerCsv = await exportApplicationsCsv(owner.id);
    expect(ownerCsv).toContain("Already tracked");
    expect(ownerCsv).not.toContain("Role A");
  });
});
