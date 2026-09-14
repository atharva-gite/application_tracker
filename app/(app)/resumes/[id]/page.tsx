import Link from "next/link";

import { canPreviewInBrowser } from "@/lib/document-file";
import { loadOrNotFound } from "@/lib/load-or-not-found";
import { documentTypeLabels } from "@/lib/labels";
import { requireUser } from "@/server/authorization/require-user";
import { getDocument } from "@/server/services/document-service";

export const metadata = { title: "Resume" };

export default async function ResumeViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const document = await loadOrNotFound(() => getDocument(user.id, id));
  const previewable = canPreviewInBrowser(document.mimeType);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/resumes" className="text-sm text-stone-500 hover:text-stone-900">
            ← All resumes
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{document.name}</h1>
          <p className="mt-1 text-sm text-stone-600">
            {documentTypeLabels[document.type]} · {document.filename}
          </p>
        </div>
        <a href={`/api/documents/${document.id}/download`} className="btn-secondary">
          Download
        </a>
      </div>

      {previewable ? (
        <iframe
          title={document.name}
          src={`/api/documents/${document.id}/view`}
          className="h-[calc(100vh-14rem)] min-h-[32rem] w-full rounded-2xl border border-border bg-white"
        />
      ) : (
        <section className="card p-8">
          <h2 className="text-lg font-medium">Preview is available for PDFs</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600">
            This file is a Word document. Download it to open locally, or upload a PDF
            version to read it here.
          </p>
          <a href={`/api/documents/${document.id}/download`} className="btn-primary mt-5">
            Download file
          </a>
        </section>
      )}
    </div>
  );
}
