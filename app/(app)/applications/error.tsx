"use client";

import Link from "next/link";

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Could not load applications</h1>
      <p className="mt-2 text-sm text-stone-600">
        Something went wrong while loading this list. Your data was not changed.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/applications" className="btn-secondary">
          Reset filters
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-4 text-xs text-stone-400">Reference {error.digest}</p>
      ) : null}
    </div>
  );
}
