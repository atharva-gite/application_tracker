"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type ImportResult = {
  created: number;
  skipped: Array<{ row: number; message: string }>;
};

export function CsvImportForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await fetch("/api/applications/import", {
        method: "POST",
        body: data,
      });
      const body = (await response.json()) as
        | ImportResult
        | { error?: { message?: string } };
      if (!response.ok) {
        setMessage(
          "error" in body && body.error?.message
            ? body.error.message
            : "Could not import that file.",
        );
        return;
      }
      if (!("created" in body)) {
        setMessage("Could not import that file.");
        return;
      }
      setResult(body);
      form.reset();
    } catch {
      setMessage("Could not import that file. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      {message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">{message}</p>
      ) : null}
      <div>
        <label htmlFor="file" className="mb-1 block text-sm font-medium text-stone-800">
          CSV file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-stone-700"
        />
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Importing…" : "Import"}
      </button>
      {result ? (
        <div className="space-y-3 text-sm">
          <p>
            Imported {result.created} application{result.created === 1 ? "" : "s"}.
            {result.skipped.length > 0
              ? ` ${result.skipped.length} row${result.skipped.length === 1 ? "" : "s"} skipped.`
              : ""}
          </p>
          {result.skipped.length > 0 ? (
            <ul className="space-y-1 text-stone-600">
              {result.skipped.map((row) => (
                <li key={`${row.row}-${row.message}`}>
                  Row {row.row}: {row.message}
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/applications" className="font-medium text-accent">
            View applications
          </Link>
        </div>
      ) : null}
    </form>
  );
}
