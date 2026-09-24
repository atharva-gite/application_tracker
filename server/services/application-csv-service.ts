import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { applicationsToCsv, parseApplicationCsv } from "@/lib/application-csv";
import { PRODUCT_EVENTS } from "@/lib/product-events";
import { applicationRepository } from "@/server/repositories/application-repository";
import { productEventRepository } from "@/server/repositories/product-event-repository";
import { createApplication } from "@/server/services/application-service";

export async function exportApplicationsCsv(userId: string) {
  const applications = await applicationRepository.listForExport(userId);
  return applicationsToCsv(
    applications.map((application) => ({
      companyName: application.company.name,
      roleTitle: application.roleTitle,
      status: application.status,
      applicationDate: application.applicationDate,
      deadline: application.deadline,
      source: application.source,
      location: application.location,
      jobUrl: application.jobUrl,
    })),
  );
}

export async function importApplications(userId: string, csv: string) {
  const parsed = parseApplicationCsv(csv);
  if (!parsed.ok) {
    throw new AppError("VALIDATION_ERROR", parsed.message);
  }

  let created = 0;
  const skipped = [...parsed.skipped];

  for (const row of parsed.rows) {
    try {
      await createApplication(userId, row.input);
      created += 1;
    } catch (error) {
      skipped.push({
        row: row.row,
        message:
          error instanceof AppError
            ? error.message
            : "This row could not be imported.",
      });
      logger.error("application.csv_row_failed", {
        userId,
        row: row.row,
      });
    }
  }

  skipped.sort((left, right) => left.row - right.row);

  if (created > 0) {
    await productEventRepository.record({
      userId,
      name: PRODUCT_EVENTS.csvImported,
    });
    logger.info("application.csv_imported", { userId, created, skipped: skipped.length });
  }

  return { created, skipped };
}
