import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <div className="min-h-full">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          {signedIn ? (
            <Link href="/dashboard" className="btn-primary">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Create account
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-8">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-accent ring-1 ring-border">
              For internships and first jobs
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.1]">
              Know what is happening with every application, and what to do next.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-stone-600">
              Stop scattering your search across spreadsheets, emails, and notes.
              Pipeline keeps applications, interviews, and follow-ups in one
              place so you never miss a deadline.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {signedIn ? (
                <Link href="/dashboard" className="btn-primary px-5 py-3">
                  Continue tracking
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary px-5 py-3">
                    Start tracking
                  </Link>
                  <Link href="/login" className="btn-secondary px-5 py-3">
                    I already have an account
                  </Link>
                </>
              )}
            </div>
          </div>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-500">Needs attention</p>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                3 due
              </span>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <PreviewRow kind="Interview" title="Google interview" when="Tomorrow · 10:00 AM" />
              <PreviewRow kind="Deadline" title="Meta · SWE Intern" when="In 2 days" />
              <PreviewRow kind="Follow-up" title="Stripe recruiter" when="Sep 19" />
            </ul>
            <p className="mt-5 text-xs leading-5 text-stone-500">
              Your dashboard surfaces interviews, deadlines, and follow-ups so
              the next step is obvious.
            </p>
          </section>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          <Feature
            title="One pipeline"
            body="Move roles from saved to offer. Every status change is kept, so you can see how the search is going."
          />
          <Feature
            title="What to do today"
            body="Upcoming interviews, approaching deadlines, and overdue follow-ups show up before anything else."
          />
          <Feature
            title="The details that matter"
            body="Notes, contacts, resumes, and meeting links live on the application, not in another tab."
          />
        </section>
      </main>

      <footer className="border-t border-border/80">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-stone-500">
          <p>Pipeline · internship and job search tracker</p>
          {signedIn ? (
            <Link href="/dashboard" className="text-accent">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-accent">
              Log in
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

function PreviewRow({
  kind,
  title,
  when,
}: {
  kind: string;
  title: string;
  when: string;
}) {
  return (
    <li className="rounded-xl bg-white px-4 py-3 ring-1 ring-border">
      <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">{kind}</p>
      <p className="font-medium text-stone-900">{title}</p>
      <p className="text-stone-500">{when}</p>
    </li>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <h2 className="font-medium text-stone-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
    </div>
  );
}
