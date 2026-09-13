"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">This page could not be loaded</h1>
      <p className="mt-2 max-w-md text-sm text-stone-600">
        Something went wrong while rendering this screen. Your data was not
        changed. You can try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
