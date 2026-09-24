import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, ErrorCode } from "@/lib/errors";
import { MAX_DOCUMENT_BYTES } from "@/lib/validation/document";

const put = vi.fn();
const remove = vi.fn();
const create = vi.fn();

vi.mock("@/lib/storage", () => ({
  storage: {
    put: (...args: unknown[]) => put(...args),
    delete: (...args: unknown[]) => remove(...args),
    get: vi.fn(),
  },
}));

vi.mock("@/server/repositories/document-repository", () => ({
  documentRepository: {
    create: (...args: unknown[]) => create(...args),
  },
}));

describe("document upload failures", () => {
  beforeEach(() => {
    put.mockReset();
    remove.mockReset();
    create.mockReset();
  });

  it("does not create a document record when storage put fails", async () => {
    put.mockRejectedValue(new Error("storage unavailable"));
    const { uploadDocument } = await import("@/server/services/document-service");

    await expect(
      uploadDocument(
        "user-1",
        { name: "Resume - Backend", type: "RESUME" },
        {
          name: "resume.pdf",
          type: "application/pdf",
          size: 8,
          bytes: Buffer.from("%PDF-1.1"),
        },
      ),
    ).rejects.toThrow("storage unavailable");

    expect(create).not.toHaveBeenCalled();
  });

  it("does not create a document record for invalid files", async () => {
    const { uploadDocument } = await import("@/server/services/document-service");

    await expect(
      uploadDocument(
        "user-1",
        { name: "Resume", type: "RESUME" },
        {
          name: "resume.pdf",
          type: "application/pdf",
          size: MAX_DOCUMENT_BYTES + 1,
          bytes: Buffer.from("%PDF"),
        },
      ),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });

    expect(put).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("removes stored bytes if metadata insert fails", async () => {
    put.mockResolvedValue(undefined);
    create.mockRejectedValue(new AppError("INTERNAL_ERROR", "Could not save document."));
    const { uploadDocument } = await import("@/server/services/document-service");

    await expect(
      uploadDocument(
        "user-1",
        { name: "Resume - Backend", type: "RESUME" },
        {
          name: "resume.pdf",
          type: "application/pdf",
          size: 8,
          bytes: Buffer.from("%PDF-1.1"),
        },
      ),
    ).rejects.toMatchObject({ code: ErrorCode.INTERNAL_ERROR });

    expect(remove).toHaveBeenCalled();
  });
});
