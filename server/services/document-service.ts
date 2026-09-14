import { randomUUID } from "node:crypto";
import path from "node:path";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serializeDocument } from "@/lib/serializers";
import { storage } from "@/lib/storage";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_BYTES,
  type DocumentMetaInput,
} from "@/lib/validation/document";
import { documentRepository } from "@/server/repositories/document-repository";
import { getOwnedApplication } from "@/server/services/application-service";
import { assertOwnedBy } from "@/server/authorization/ownership";

async function getOwnedDocument(id: string, userId: string) {
  const document = await documentRepository.findById(id);
  if (!document) {
    throw new AppError("NOT_FOUND", "Document not found.");
  }
  assertOwnedBy(document.userId, userId, "Document not found.");
  return document;
}

export async function listDocuments(
  userId: string,
  query: { page: number; pageSize: number; type?: DocumentMetaInput["type"] },
) {
  const [items, total] = await documentRepository.list(userId, query);
  return {
    documents: items.map(serializeDocument),
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}

export async function getDocument(userId: string, id: string) {
  return serializeDocument(await getOwnedDocument(id, userId));
}

export async function uploadDocument(
  userId: string,
  input: DocumentMetaInput,
  file: { name: string; type: string; size: number; bytes: Buffer },
) {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new AppError("VALIDATION_ERROR", "Files must be 5 MB or smaller.");
  }
  if (
    !ALLOWED_DOCUMENT_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number],
    )
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Upload a PDF or Word document.",
    );
  }

  const id = randomUUID();
  const ext = path.extname(file.name) || ".bin";
  const storageKey = `documents/${userId}/${id}${ext}`;
  await storage.put(storageKey, file.bytes);

  const document = await documentRepository.create(userId, {
    ...input,
    filename: file.name,
    mimeType: file.type,
    fileSize: file.size,
    storageKey,
  });
  logger.info("document.uploaded", { userId, documentId: document.id });
  return serializeDocument(document);
}

export async function getDocumentFile(userId: string, id: string) {
  const document = await getOwnedDocument(id, userId);
  const bytes = await storage.get(document.storageKey);
  if (!bytes) {
    throw new AppError("NOT_FOUND", "Document file is missing.");
  }
  return { document, bytes };
}

export async function deleteDocument(userId: string, id: string) {
  const document = await getOwnedDocument(id, userId);
  await documentRepository.delete(id);
  await storage.delete(document.storageKey);
  logger.info("document.deleted", { userId, documentId: id });
  return { ok: true };
}

export async function listApplicationDocuments(userId: string, applicationId: string) {
  await getOwnedApplication(applicationId, userId);
  const links = await documentRepository.listForApplication(applicationId);
  return { documents: links.map((link) => serializeDocument(link.document)) };
}

export async function linkApplicationDocument(
  userId: string,
  applicationId: string,
  documentId: string,
) {
  await getOwnedApplication(applicationId, userId);
  await getOwnedDocument(documentId, userId);
  await documentRepository.linkToApplication(applicationId, documentId);
  return { ok: true };
}

export async function unlinkApplicationDocument(
  userId: string,
  applicationId: string,
  documentId: string,
) {
  await getOwnedApplication(applicationId, userId);
  await getOwnedDocument(documentId, userId);
  await documentRepository.unlinkFromApplication(applicationId, documentId);
  return { ok: true };
}
