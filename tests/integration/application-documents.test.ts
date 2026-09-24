import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { applicationCreateSchema } from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import {
  createTestApplication,
  createTestUser,
  ensureDatabase,
} from "@/tests/helpers/db";

async function uploadResume(userId: string, name: string) {
  const { uploadDocument } = await import("@/server/services/document-service");
  return uploadDocument(
    userId,
    { name, type: "RESUME" },
    {
      name: `${name}.pdf`,
      type: "application/pdf",
      size: 8,
      bytes: Buffer.from("%PDF-1.1"),
    },
  );
}

describe("application resume relationship", () => {
  it("attaches, changes, and counts an existing resume without deleting applications", async (context) => {
    await ensureDatabase(context);
    const owner = await createTestUser("Resume Owner");
    const other = await createTestUser("Resume Other");
    const {
      createApplication,
      getApplication,
    } = await import("@/server/services/application-service");
    const {
      deleteDocument,
      getDocumentFile,
      linkApplicationDocument,
      listApplicationDocuments,
      listDocuments,
      unlinkApplicationDocument,
      uploadDocument,
    } = await import("@/server/services/document-service");

    const resume = await uploadResume(owner.id, "Resume — Software Engineering");
    const otherResume = await uploadResume(other.id, "Other Resume");
    const replacement = await uploadResume(owner.id, "Resume — Backend");

    const application = await createApplication(
      owner.id,
      parseSchema(applicationCreateSchema, {
        companyName: "Stripe",
        roleTitle: "Software Engineering Intern",
        status: "SAVED",
        documentId: resume.id,
      }),
    );

    const attached = await listApplicationDocuments(owner.id, application.id);
    expect(attached.resume?.id).toBe(resume.id);
    expect(attached.resume?.name).toBe("Resume — Software Engineering");

    const usage = await listDocuments(owner.id, { page: 1, pageSize: 50, type: "RESUME" });
    expect(usage.documents.find((doc) => doc.id === resume.id)?.applicationCount).toBe(1);
    expect(usage.documents.find((doc) => doc.id === replacement.id)?.applicationCount).toBe(0);

    await expect(
      linkApplicationDocument(owner.id, application.id, otherResume.id),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(getDocumentFile(other.id, resume.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });

    await linkApplicationDocument(owner.id, application.id, replacement.id);
    const changed = await listApplicationDocuments(owner.id, application.id);
    expect(changed.resume?.id).toBe(replacement.id);
    expect(changed.documents.filter((doc) => doc.type === "RESUME")).toHaveLength(1);

    const afterChange = await listDocuments(owner.id, { page: 1, pageSize: 50, type: "RESUME" });
    expect(afterChange.documents.find((doc) => doc.id === resume.id)?.applicationCount).toBe(0);
    expect(
      afterChange.documents.find((doc) => doc.id === replacement.id)?.applicationCount,
    ).toBe(1);

    await unlinkApplicationDocument(owner.id, application.id, replacement.id);
    const removed = await listApplicationDocuments(owner.id, application.id);
    expect(removed.resume).toBeNull();
    await expect(getApplication(owner.id, application.id)).resolves.toMatchObject({
      id: application.id,
    });

    await linkApplicationDocument(owner.id, application.id, replacement.id);
    await deleteDocument(owner.id, replacement.id);
    const afterDelete = await listApplicationDocuments(owner.id, application.id);
    expect(afterDelete.resume).toBeNull();
    const stillThere = await prisma.application.findUnique({ where: { id: application.id } });
    expect(stillThere?.id).toBe(application.id);
    expect(stillThere?.roleTitle).toBe("Software Engineering Intern");

    const later = await createTestApplication(owner.id, {
      companyName: "Notion",
      roleTitle: "Intern",
    });
    const laterDocs = await listApplicationDocuments(owner.id, later.id);
    expect(laterDocs.resume).toBeNull();
    expect(laterDocs.documents).toHaveLength(0);

    const coverLetter = await uploadDocument(
      owner.id,
      { name: "Cover letter", type: "COVER_LETTER" },
      {
        name: "cover.pdf",
        type: "application/pdf",
        size: 8,
        bytes: Buffer.from("%PDF-1.1"),
      },
    );
    await expect(
      createApplication(
        owner.id,
        parseSchema(applicationCreateSchema, {
          companyName: "Linear",
          roleTitle: "Intern",
          status: "SAVED",
          documentId: coverLetter.id,
        }),
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
