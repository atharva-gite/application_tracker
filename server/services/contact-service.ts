import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serializeContact } from "@/lib/serializers";
import type {
  ContactInput,
  ContactListQuery,
  ContactUpdateInput,
} from "@/lib/validation/contact";
import { assertOwnedBy } from "@/server/authorization/ownership";
import { contactRepository } from "@/server/repositories/contact-repository";
import { getOwnedApplication } from "@/server/services/application-service";
import { getOwnedCompany } from "@/server/services/company-service";

type LinkInput = {
  contactId: string;
  relationshipType?: string;
};

async function getOwnedContact(id: string, userId: string) {
  const contact = await contactRepository.findById(id);
  if (!contact) {
    throw new AppError("NOT_FOUND", "Contact not found.");
  }
  assertOwnedBy(contact.userId, userId, "Contact not found.");
  return contact;
}

async function maybeCheckCompany(userId: string, companyId?: string) {
  if (companyId) {
    await getOwnedCompany(companyId, userId);
  }
}

export async function listContacts(userId: string, query: ContactListQuery) {
  const { items, total } = await contactRepository.list(userId, query);
  return {
    contacts: items.map(serializeContact),
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}

export async function createContact(userId: string, input: ContactInput) {
  await maybeCheckCompany(userId, input.companyId);
  const contact = await contactRepository.create(userId, input);
  logger.info("contact.created", { userId, contactId: contact.id });
  return serializeContact(contact);
}

export async function updateContact(
  userId: string,
  id: string,
  input: ContactUpdateInput,
) {
  await getOwnedContact(id, userId);
  await maybeCheckCompany(userId, input.companyId);
  const contact = await contactRepository.update(id, input);
  logger.info("contact.updated", { userId, contactId: id });
  return serializeContact(contact);
}

export async function deleteContact(userId: string, id: string) {
  await getOwnedContact(id, userId);
  await contactRepository.delete(id);
  logger.info("contact.deleted", { userId, contactId: id });
  return { ok: true };
}

export async function listApplicationContacts(userId: string, applicationId: string) {
  await getOwnedApplication(applicationId, userId);
  const links = await contactRepository.listForApplication(applicationId);
  return {
    contacts: links.map((link) => ({
      ...serializeContact(link.contact),
      relationshipType: link.relationshipType,
    })),
  };
}

export async function linkApplicationContact(
  userId: string,
  applicationId: string,
  input: LinkInput,
) {
  await getOwnedApplication(applicationId, userId);
  await getOwnedContact(input.contactId, userId);
  await contactRepository.linkToApplication(
    applicationId,
    input.contactId,
    input.relationshipType,
  );
  return { ok: true };
}

export async function unlinkApplicationContact(
  userId: string,
  applicationId: string,
  contactId: string,
) {
  await getOwnedApplication(applicationId, userId);
  await getOwnedContact(contactId, userId);
  await contactRepository.unlinkFromApplication(applicationId, contactId);
  return { ok: true };
}

export { getOwnedContact };
