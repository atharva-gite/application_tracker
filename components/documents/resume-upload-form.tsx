"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResumeUploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setError(null);
    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
    const body = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(body.error?.message ?? "Upload failed.");
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <div>
        <label htmlFor="resume-name" className="mb-1.5 block text-sm font-medium">
          Name
        </label>
        <input
          id="resume-name"
          name="name"
          required
          placeholder="Resume - Software Engineering"
          className="input"
        />
      </div>
      <div>
        <label htmlFor="resume-type" className="mb-1.5 block text-sm font-medium">
          Type
        </label>
        <select id="resume-type" name="type" defaultValue="RESUME" className="input">
          <option value="RESUME">Resume</option>
          <option value="COVER_LETTER">Cover letter</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="resume-file" className="mb-1.5 block text-sm font-medium">
          File
        </label>
        <input
          id="resume-file"
          name="file"
          type="file"
          required
          accept=".pdf,.doc,.docx,application/pdf"
          className="block w-full text-sm"
        />
      </div>
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
