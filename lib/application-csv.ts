import { z } from "zod";

import { parseCsv, toCsv } from "@/lib/csv";
import { formatDateOnly } from "@/lib/domain";
import { statusLabels } from "@/lib/labels";
import {
  APPLICATION_STATUSES,
  isApplicationStatus,
  type ApplicationCreateInput,
  type ApplicationStatusValue,
} from "@/lib/validation/application";
import { dateOnlySchema, optional } from "@/lib/validation/helpers";

export const APPLICATION_CSV_HEADERS = [
  "company",
  "role",
  "status",
  "application_date",
  "deadline",
  "source",
  "location",
  "job_url",
] as const;

export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_BYTES = 256 * 1024;

const HEADER_ALIASES: Record<string, (typeof APPLICATION_CSV_HEADERS)[number]> = {
  company: "company",
  company_name: "company",
  role: "role",
  role_title: "role",
  status: "status",
  application_date: "application_date",
  applied: "application_date",
  applied_on: "application_date",
  deadline: "deadline",
  source: "source",
  location: "location",
  job_url: "job_url",
  url: "job_url",
};

const rowSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company is required.")
    .max(120, "Company name must be 120 characters or fewer."),
  role: z
    .string()
    .trim()
    .min(1, "Role is required.")
    .max(160, "Role title must be 160 characters or fewer."),
  status: optional(z.string().trim().max(40)),
  application_date: optional(dateOnlySchema),
  deadline: optional(dateOnlySchema),
  source: optional(z.string().trim().max(80, "Source must be 80 characters or fewer.")),
  location: optional(z.string().trim().max(160, "Location must be 160 characters or fewer.")),
  job_url: optional(z.url("Enter a valid job URL.")),
});

export type CsvSkippedRow = {
  row: number;
  message: string;
};

export type ParsedApplicationCsv =
  | { ok: false; message: string }
  | {
      ok: true;
      rows: Array<{ row: number; input: ApplicationCreateInput }>;
      skipped: CsvSkippedRow[];
    };

export type ExportableApplication = {
  companyName: string;
  roleTitle: string;
  status: ApplicationStatusValue;
  applicationDate: Date | null;
  deadline: Date | null;
  source: string | null;
  location: string | null;
  jobUrl: string | null;
};

function headerKey(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function parseStatus(value: string | undefined): ApplicationStatusValue | string {
  if (!value?.trim()) {
    return "SAVED";
  }
  const trimmed = value.trim();
  const normalized = trimmed.toUpperCase().replace(/[\s-]+/g, "_");
  if (isApplicationStatus(normalized)) {
    return normalized;
  }
  const fromLabel = APPLICATION_STATUSES.find(
    (status) => statusLabels[status].toLowerCase() === trimmed.toLowerCase(),
  );
  if (fromLabel) {
    return fromLabel;
  }
  return `Unknown status "${trimmed}". Use one of: ${APPLICATION_STATUSES.join(", ")}.`;
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "This row could not be imported.";
}

export function parseApplicationCsv(text: string): ParsedApplicationCsv {
  let table: string[][];
  try {
    table = parseCsv(text);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "The CSV could not be read.",
    };
  }

  if (table.length === 0) {
    return { ok: false, message: "The file has no header row." };
  }

  const header = table[0] ?? [];
  const columns = new Map<(typeof APPLICATION_CSV_HEADERS)[number], number>();
  header.forEach((cell, index) => {
    const alias = HEADER_ALIASES[headerKey(cell)];
    if (alias && !columns.has(alias)) {
      columns.set(alias, index);
    }
  });

  if (!columns.has("company") || !columns.has("role")) {
    return {
      ok: false,
      message: "The header row must include company and role columns.",
    };
  }

  const dataRows = table.slice(1);
  if (dataRows.length === 0) {
    return { ok: false, message: "The file has no application rows." };
  }
  if (dataRows.length > MAX_IMPORT_ROWS) {
    return {
      ok: false,
      message: `Import up to ${MAX_IMPORT_ROWS} applications at a time.`,
    };
  }

  const rows: Array<{ row: number; input: ApplicationCreateInput }> = [];
  const skipped: CsvSkippedRow[] = [];

  dataRows.forEach((cells, index) => {
    const rowNumber = index + 2;
    const read = (name: (typeof APPLICATION_CSV_HEADERS)[number]) => {
      const column = columns.get(name);
      if (column === undefined) {
        return "";
      }
      return cells[column] ?? "";
    };

    const parsed = rowSchema.safeParse({
      company: read("company"),
      role: read("role"),
      status: read("status"),
      application_date: read("application_date"),
      deadline: read("deadline"),
      source: read("source"),
      location: read("location"),
      job_url: read("job_url"),
    });
    if (!parsed.success) {
      skipped.push({ row: rowNumber, message: firstIssue(parsed.error) });
      return;
    }

    const status = parseStatus(parsed.data.status);
    if (!isApplicationStatus(status)) {
      skipped.push({ row: rowNumber, message: status });
      return;
    }

    rows.push({
      row: rowNumber,
      input: {
        companyName: parsed.data.company,
        roleTitle: parsed.data.role,
        status,
        applicationDate: parsed.data.application_date,
        deadline: parsed.data.deadline,
        source: parsed.data.source,
        location: parsed.data.location,
        jobUrl: parsed.data.job_url,
      },
    });
  });

  return { ok: true, rows, skipped };
}

export function applicationsToCsv(applications: ExportableApplication[]) {
  const rows = applications.map((application) => [
    application.companyName,
    application.roleTitle,
    application.status,
    formatDateOnly(application.applicationDate) ?? "",
    formatDateOnly(application.deadline) ?? "",
    application.source ?? "",
    application.location ?? "",
    application.jobUrl ?? "",
  ]);
  return toCsv(APPLICATION_CSV_HEADERS, rows);
}
