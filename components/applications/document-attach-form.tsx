"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DocumentAttachForm({
  applicationId,
  documents,
}: {
  applicationId: string;
  documents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const existingId = String(formData.get("documentId") ?? "");
    setPending(true);
    setError(null);
    try {
      let documentId = existingId;
      const file = formData.get("file");
      if (file instanceof File && file.size > 0) {
        const upload = new FormData();
        upload.set("file", file);
        upload.set("name", String(formData.get("name") || file.name));
        upload.set("type", String(formData.get("type") || "RESUME"));
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: upload,
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error?.message ?? "Upload failed.");
        }
        documentId = body.document.id;
      }
      if (!documentId) {
        throw new Error("Choose an existing resume or upload a file.");
      }
      const link = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const linkBody = await link.json();
      if (!link.ok) {
        throw new Error(linkBody.error?.message ?? "Could not attach document.");
      }
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not attach document.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <select name="documentId" className="input">
        <option value="">Link an existing document</option>
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name}
          </option>
        ))}
      </select>
      <input name="name" placeholder="Or upload a new resume name" className="input" />
      <select name="type" defaultValue="RESUME" className="input">
        <option value="RESUME">Resume</option>
        <option value="COVER_LETTER">Cover letter</option>
        <option value="OTHER">Other</option>
      </select>
      <input name="file" type="file" accept=".pdf,.doc,.docx,application/pdf" className="block w-full text-sm" />
      <button
        disabled={pending}
        className="btn-primary"
      >
        {pending ? "Saving…" : "Attach document"}
      </button>
    </form>
  );
}
