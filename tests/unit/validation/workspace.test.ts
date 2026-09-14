import { describe, expect, it } from "vitest";

import { AppError, ErrorCode, toErrorBody } from "@/lib/errors";
import { MAX_DOCUMENT_BYTES } from "@/lib/validation/document";
import { parseSchema } from "@/lib/validation/helpers";
import { contactInputSchema } from "@/lib/validation/contact";
import { documentMetaSchema } from "@/lib/validation/document";
import { followUpInputSchema } from "@/lib/validation/follow-up";
import { interviewInputSchema } from "@/lib/validation/interview";
import { noteInputSchema } from "@/lib/validation/note";
import { uploadDocument } from "@/server/services/document-service";

describe("interview validation", () => {
  it("accepts a technical interview", () => {
    const input = parseSchema(interviewInputSchema, {
      scheduledAt: "2026-09-17T10:00",
      type: "TECHNICAL",
      interviewerName: "Jane Doe",
      meetingUrl: "https://meet.example.com/abc",
    });
    expect(input.type).toBe("TECHNICAL");
    expect(input.status).toBe("SCHEDULED");
  });

  it("rejects an invalid meeting URL", () => {
    expect(() =>
      parseSchema(interviewInputSchema, {
        scheduledAt: "2026-09-17T10:00",
        type: "TECHNICAL",
        meetingUrl: "not-a-url",
      }),
    ).toThrow(AppError);
  });
});

describe("note validation", () => {
  it("rejects empty notes", () => {
    expect(() => parseSchema(noteInputSchema, { content: "   " })).toThrow(AppError);
  });

  it("rejects extremely long notes", () => {
    expect(() =>
      parseSchema(noteInputSchema, { content: "n".repeat(8001) }),
    ).toThrow(AppError);
  });
});

describe("follow-up validation", () => {
  it("requires a due date and type", () => {
    const input = parseSchema(followUpInputSchema, {
      dueAt: "2026-09-17T09:00",
      type: "RECRUITER",
      note: "Follow up with recruiter",
    });
    expect(input.type).toBe("RECRUITER");
  });
});

describe("contact validation", () => {
  it("lowercases email addresses", () => {
    const input = parseSchema(contactInputSchema, {
      name: "Alex Recruiter",
      email: "Alex@Company.COM",
    });
    expect(input.email).toBe("alex@company.com");
  });
});

describe("document validation", () => {
  it("requires a document name and type", () => {
    expect(
      parseSchema(documentMetaSchema, {
        name: "Resume - Software Engineering",
        type: "RESUME",
      }).type,
    ).toBe("RESUME");
  });

  it("rejects oversized files before storage", async () => {
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
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });

  it("rejects disallowed MIME types", async () => {
    await expect(
      uploadDocument(
        "user-1",
        { name: "malware", type: "OTHER" },
        {
          name: "file.exe",
          type: "application/x-msdownload",
          size: 12,
          bytes: Buffer.from("MZ"),
        },
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });
});

describe("error details", () => {
  it("can include field errors without leaking internals", () => {
    const error = new AppError("VALIDATION_ERROR", "Please correct the highlighted fields.", {
      roleTitle: ["Role title is required."],
    });
    expect(toErrorBody(error)).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        details: { roleTitle: ["Role title is required."] },
      },
    });
  });
});
