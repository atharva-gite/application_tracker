import { DocumentType } from "@prisma/client";
import { z } from "zod";

import { optional, paginationSchema } from "@/lib/validation/helpers";

export const DOCUMENT_TYPES = [
  "RESUME",
  "COVER_LETTER",
  "OTHER",
] as const satisfies readonly DocumentType[];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

export const documentMetaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Document name is required.")
    .max(160, "Document name must be 160 characters or fewer."),
  type: z.enum(DOCUMENT_TYPES),
});

export const documentListQuerySchema = paginationSchema.extend({
  type: optional(z.enum(DOCUMENT_TYPES)),
});

export const applicationDocumentSchema = z.object({
  documentId: z.string().min(1, "Document is required."),
});

export type DocumentMetaInput = z.infer<typeof documentMetaSchema>;
