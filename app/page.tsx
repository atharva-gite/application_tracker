import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-full">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-lg font-semibold tracking-tight">Pipeline</p>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-md px-3 py-2 text-stone-700 hover:bg-white">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-accent px-3 py-2 font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Create account
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-10 lg:flex-row lg:items-center">
        <section className="max-w-xl">
          <p className="text-sm font-medium text-accent">Internship and job search tracker</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Know what is happening with every application, and what to do next.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Stop scattering your search across spreadsheets, emails, and notes.
            Pipeline keeps applications, interviews, and follow-ups in one
            place so you can stay on top of your job search.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Start tracking
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-border bg-white px-5 py-3 text-sm font-medium text-stone-800"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Today</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-lg bg-white px-4 py-3">
              Google interview · tomorrow
            </li>
            <li className="rounded-lg bg-white px-4 py-3">
              Meta deadline · Sep 18
            </li>
            <li className="rounded-lg bg-white px-4 py-3">
              Stripe follow-up · Sep 19
            </li>
          </ul>
          <p className="mt-6 text-xs text-stone-500">
            Your dashboard will surface interviews, deadlines, and follow-ups
            that need attention.
          </p>
        </section>
      </main>
    </div>
  );
}
