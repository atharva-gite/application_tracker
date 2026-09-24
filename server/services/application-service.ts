import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serializeApplication, serializeStatusHistory } from "@/lib/serializers";
import {
  isAllowedApplicationStatusTransition,
  type ApplicationCreateInput,
  type ApplicationListQuery,
  type ApplicationStatusInput,
  type ApplicationUpdateInput,
} from "@/lib/validation/application";
import { assertOwnedBy } from "@/server/authorization/ownership";
import { applicationRepository } from "@/server/repositories/application-repository";
import { companyRepository } from "@/server/repositories/company-repository";
import { documentRepository } from "@/server/repositories/document-repository";
import { getOwnedCompany } from "@/server/services/company-service";

async function getOwnedApplication(id: string, userId: string) {
  const application = await applicationRepository.findById(id);
  if (!application) {
    throw new AppError("NOT_FOUND", "Application not found.");
  }
  assertOwnedBy(application.userId, userId, "Application not found.");
  return application;
}

async function resolveCompanyId(userId: string, input: {
  companyId?: string;
  companyName?: string;
  companyWebsite?: string;
}) {
  if (input.companyId) {
    await getOwnedCompany(input.companyId, userId);
    return input.companyId;
  }
  if (!input.companyName) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Select an existing company or enter a company name.",
    );
  }
  const company = await companyRepository.findOrCreate(userId, {
    name: input.companyName,
    website: input.companyWebsite,
  });
  return company.id;
}

export async function listApplications(userId: string, query: ApplicationListQuery) {
  const { items, total } = await applicationRepository.list(userId, query);
  return {
    applications: items.map(serializeApplication),
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}

export async function getApplication(userId: string, id: string) {
  const application = await getOwnedApplication(id, userId);
  return serializeApplication(application);
}

async function requireOwnedResume(userId: string, documentId: string) {
  const document = await documentRepository.findById(documentId);
  if (!document) {
    throw new AppError("NOT_FOUND", "Document not found.");
  }
  assertOwnedBy(document.userId, userId, "Document not found.");
  if (document.type !== "RESUME") {
    throw new AppError("VALIDATION_ERROR", "Select a resume for this application.");
  }
  return document;
}

export async function createApplication(
  userId: string,
  input: ApplicationCreateInput,
) {
  if (input.documentId) {
    await requireOwnedResume(userId, input.documentId);
  }
  const companyId = await resolveCompanyId(userId, input);
  const application = await applicationRepository.create({
    userId,
    companyId,
    input,
  });
  logger.info("application.created", {
    userId,
    applicationId: application.id,
    status: application.status,
  });
  return serializeApplication(application);
}

export async function updateApplication(
  userId: string,
  id: string,
  input: ApplicationUpdateInput,
) {
  await getOwnedApplication(id, userId);
  const companyId =
    input.companyId || input.companyName
      ? await resolveCompanyId(userId, input)
      : undefined;
  const application = await applicationRepository.update(
    id,
    userId,
    input,
    companyId,
  );
  logger.info("application.updated", { userId, applicationId: id });
  return serializeApplication(application);
}

export async function changeApplicationStatus(
  userId: string,
  id: string,
  input: ApplicationStatusInput,
) {
  const current = await getOwnedApplication(id, userId);
  if (!isAllowedApplicationStatusTransition(current.status, input.status)) {
    throw new AppError("VALIDATION_ERROR", "That stage change is not allowed.");
  }
  const application = await applicationRepository.changeStatus(
    id,
    userId,
    input.status,
  );
  logger.info("application.status_changed", {
    userId,
    applicationId: id,
    status: input.status,
  });
  return serializeApplication(application);
}

export async function archiveApplication(userId: string, id: string) {
  const current = await getOwnedApplication(id, userId);
  if (current.archivedAt) {
    return serializeApplication(current);
  }
  const application = await applicationRepository.archive(id, userId);
  logger.info("application.archived", { userId, applicationId: id });
  return serializeApplication(application);
}

export async function getApplicationHistory(userId: string, id: string) {
  await getOwnedApplication(id, userId);
  const history = await applicationRepository.listHistory(id);
  return { history: history.map(serializeStatusHistory) };
}

export { getOwnedApplication };
