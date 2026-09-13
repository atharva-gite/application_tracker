import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-stone-600">
        That URL does not exist. Go back to the home page or your dashboard.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Go home
      </Link>
    </div>
  );
}
