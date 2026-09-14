import { isUniqueConstraintError, isForeignKeyError } from "@/lib/domain";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serializeCompany } from "@/lib/serializers";
import type {
  CompanyInput,
  CompanyListQuery,
  CompanyUpdateInput,
} from "@/lib/validation/company";
import { assertOwnedBy } from "@/server/authorization/ownership";
import { companyRepository } from "@/server/repositories/company-repository";

async function getOwnedCompany(id: string, userId: string) {
  const company = await companyRepository.findById(id);
  if (!company) {
    throw new AppError("NOT_FOUND", "Company not found.");
  }
  assertOwnedBy(company.userId, userId, "Company not found.");
  return company;
}

export async function listCompanies(userId: string, query: CompanyListQuery) {
  const { items, total } = await companyRepository.list(userId, query);
  return {
    companies: items.map(serializeCompany),
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}

export async function getCompany(userId: string, id: string) {
  const company = await getOwnedCompany(id, userId);
  return serializeCompany(company);
}

export async function createCompany(userId: string, input: CompanyInput) {
  try {
    const company = await companyRepository.create(userId, input);
    logger.info("company.created", { userId, companyId: company.id });
    return serializeCompany(company);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "CONFLICT",
        "You already have a company with this name.",
      );
    }
    throw error;
  }
}

export async function updateCompany(
  userId: string,
  id: string,
  input: CompanyUpdateInput,
) {
  await getOwnedCompany(id, userId);
  try {
    const company = await companyRepository.update(id, input);
    logger.info("company.updated", { userId, companyId: id });
    return serializeCompany(company);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        "CONFLICT",
        "You already have a company with this name.",
      );
    }
    throw error;
  }
}

export async function deleteCompany(userId: string, id: string) {
  await getOwnedCompany(id, userId);
  try {
    await companyRepository.delete(id);
  } catch (error) {
    if (isForeignKeyError(error)) {
      throw new AppError(
        "CONFLICT",
        "This company still has applications. Archive or reassign them first.",
      );
    }
    throw error;
  }
  logger.info("company.deleted", { userId, companyId: id });
  return { ok: true };
}

export { getOwnedCompany };
