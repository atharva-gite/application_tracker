import { DocumentRow } from "@/components/documents/document-row";
import { ResumeUploadForm } from "@/components/documents/resume-upload-form";
import { documentUsageLabel } from "@/lib/application-detail";
import { requireUser } from "@/server/authorization/require-user";
import { listDocuments } from "@/server/services/document-service";

export const metadata = { title: "Resumes" };

export default async function ResumesPage() {
  const user = await requireUser();
  const { documents } = await listDocuments(user.id, { page: 1, pageSize: 50 });

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Resumes</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
          Keep versions for different roles, then open them here when you need to
          check what you sent.
        </p>
        {documents.length === 0 ? (
          <section className="card mt-8 border-dashed p-8">
            <h2 className="text-lg font-medium">No documents yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
              Upload a PDF resume to view it in Folio, or a Word file to store
              and download later.
            </p>
          </section>
        ) : (
          <ul className="card mt-8 divide-y divide-border overflow-hidden">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                caption={
                  doc.applicationCount == null
                    ? undefined
                    : documentUsageLabel(doc.applicationCount)
                }
              />
            ))}
          </ul>
        )}
      </div>
      <aside className="card h-fit p-6">
        <h2 className="text-lg font-medium">Upload</h2>
        <p className="mt-1 text-sm text-stone-600">PDF files can be opened in the app.</p>
        <div className="mt-5">
          <ResumeUploadForm />
        </div>
      </aside>
    </div>
  );
}
