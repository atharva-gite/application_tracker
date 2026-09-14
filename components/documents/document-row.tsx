"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { canPreviewInBrowser } from "@/lib/document-file";

export function DocumentRow({
  document,
}: {
  document: { id: string; name: string; type: string; mimeType: string; filename: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const previewable = canPreviewInBrowser(document.mimeType);

  async function onDelete() {
    if (!window.confirm(`Delete ${document.name}?`)) {
      return;
    }
    setPending(true);
    const response = await fetch(`/api/documents/${document.id}`, { method: "DELETE" });
    setPending(false);
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <p className="font-medium">{document.name}</p>
        <p className="mt-0.5 truncate text-sm text-stone-500">{document.filename}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/resumes/${document.id}`} className="btn-secondary">
          {previewable ? "View" : "Open"}
        </Link>
        <a href={`/api/documents/${document.id}/download`} className="btn-ghost">
          Download
        </a>
        <button type="button" onClick={onDelete} disabled={pending} className="btn-ghost text-[var(--danger)]">
          {pending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </li>
  );
}
