import { describe, expect, it } from "vitest";

import { normalizeCompanyName } from "@/lib/domain";
import { parseSchema } from "@/lib/validation/helpers";
import { applicationCreateSchema, applicationListQuerySchema } from "@/lib/validation/application";
import { companyInputSchema } from "@/lib/validation/company";

describe("company name normalization", () => {
  it("collapses case and whitespace", () => {
    expect(normalizeCompanyName("  Acme   Corp ")).toBe("acme corp");
  });
});

describe("application validation", () => {
  it("requires a company", () => {
    expect(() =>
      parseSchema(applicationCreateSchema, {
        roleTitle: "SWE Intern",
      }),
    ).toThrow();
  });

  it("accepts a new company name and date filters", () => {
    const created = parseSchema(applicationCreateSchema, {
      companyName: "Google",
      roleTitle: "Software Engineering Intern",
      jobUrl: "https://careers.google.com/jobs/123",
      deadline: "2026-09-18",
    });
    expect(created.status).toBe("SAVED");
    expect(created.companyName).toBe("Google");
  });

  it("treats an empty resume selection as attach later", () => {
    const created = parseSchema(applicationCreateSchema, {
      companyName: "Stripe",
      roleTitle: "Software Engineering Intern",
      documentId: "",
    });
    expect(created.documentId).toBeUndefined();
  });

  it("rejects inverted salary ranges", () => {
    expect(() =>
      parseSchema(applicationCreateSchema, {
        companyName: "Meta",
        roleTitle: "Intern",
        salaryMin: 120000,
        salaryMax: 80000,
      }),
    ).toThrow();
  });

  it("parses list query defaults and URL filters", () => {
    const query = parseSchema(applicationListQuerySchema, {
      status: "INTERVIEW",
      sort: "deadline",
      q: "google",
    });
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(20);
    expect(query.order).toBe("desc");
    expect(query.status).toBe("INTERVIEW");
  });
});

describe("company validation", () => {
  it("rejects an invalid website", () => {
    expect(() =>
      parseSchema(companyInputSchema, {
        name: "Stripe",
        website: "not-a-url",
      }),
    ).toThrow();
  });
});
