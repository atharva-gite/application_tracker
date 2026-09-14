import Link from "next/link";

export function InterviewNotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Interview not found</h1>
      <p className="mt-2 text-sm text-stone-600">
        This interview does not exist, or you do not have access to it.
      </p>
      <Link href="/interviews" className="btn-primary mt-6">
        Back to Interviews
      </Link>
    </div>
  );
}
