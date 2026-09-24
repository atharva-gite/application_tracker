"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { canPreviewInBrowser } from "@/lib/document-file";

type Resume = {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  filename: string;
};

export function ApplicationResumePanel({
  applicationId,
  resume,
  format,
  library,
}: {
  applicationId: string;
  resume: Resume | null;
  format: string | null;
  library: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(!resume);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const previewable = resume ? canPreviewInBrowser(resume.mimeType) : false;

  async function attach(documentId: string) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error?.message ?? "Could not attach resume.");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not attach resume.");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const documentId = String(new FormData(event.currentTarget).get("documentId") ?? "");
    if (!documentId) {
      setError("Select a resume or upload one first.");
      return;
    }
    await attach(documentId);
  }

  return (
    <section className="card space-y-4 p-6">
      <h2 className="text-lg font-medium">Resume</h2>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      {resume && !editing ? (
        <div className="rounded-lg bg-white p-4 ring-1 ring-border">
          <p className="font-medium">{resume.name}</p>
          <p className="mt-1 text-sm text-stone-500">{format ?? "Document"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/resumes/${resume.id}`} className="btn-secondary">
              {previewable ? "View" : "Open"}
            </Link>
            <a href={`/api/documents/${resume.id}/download`} className="btn-secondary">
              Download
            </a>
            <button type="button" className="btn-ghost" onClick={() => setEditing(true)}>
              Change
            </button>
          </div>
        </div>
      ) : (
        <div>
          {!resume ? (
            <>
              <p className="text-sm text-stone-700">No resume attached</p>
              <p className="mt-1 text-sm text-stone-500">
                Choose a resume you already uploaded. Uploading is optional.
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-600">Replace the resume for this application.</p>
          )}
          {library.length > 0 ? (
            <form method="post" onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1 text-sm font-medium text-stone-800">
                <span className="sr-only">Choose resume</span>
                <select
                  name="documentId"
                  defaultValue={resume?.id ?? ""}
                  className="input"
                  aria-label="Choose resume"
                >
                  <option value="">Select a resume</option>
                  {library.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.name}
                    </option>
                  ))}
                </select>
              </label>
              <button disabled={pending} className="btn-primary">
                {pending ? "Saving…" : resume ? "Save" : "Attach resume"}
              </button>
              {resume ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </form>
          ) : (
            <Link href="/resumes" className="btn-secondary mt-4">
              Upload a resume
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
