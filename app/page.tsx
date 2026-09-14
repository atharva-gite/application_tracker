import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { auth } from "@/lib/auth";

const stages = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-1 text-sm">
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
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16 sm:pt-20">
          <p className="text-sm font-medium tracking-wide text-accent">
            For internships and first jobs
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.12] tracking-tight text-foreground sm:text-6xl">
            {APP_TAGLINE}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
            {APP_NAME} is a private workspace for the roles you care about —
            applications, interviews, resumes, and follow-ups, without the
            spreadsheet sprawl.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {signedIn ? (
              <Link href="/dashboard" className="btn-primary px-5 py-3">
                Continue to dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary px-5 py-3">
                  Create a free account
                </Link>
                <Link href="/login" className="btn-secondary px-5 py-3">
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <ProductPreview />
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
            <Feature
              number="01"
              title="One board for the search"
              body="Move each role from saved to offer. Status history stays attached, so you can see how the search is actually going."
            />
            <Feature
              number="02"
              title="Today’s next step"
              body="Interviews, deadlines, and overdue follow-ups surface first. The dashboard is for action, not vanity charts."
            />
            <Feature
              number="03"
              title="The file, not another tab"
              body="Notes, contacts, resumes, and meeting links live on the application. Open one page and you have the full picture."
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                Built around the real loop.
              </h2>
              <p className="mt-4 max-w-md text-stone-600 leading-7">
                Add a role, keep it moving, and always know what needs you next.
                Nothing extra until the core workflow is solid.
              </p>
            </div>
            <ol className="space-y-4">
              <Step
                n="1"
                title="Capture the role"
                body="Company, title, link, deadline, and the resume you used — in one form."
              />
              <Step
                n="2"
                title="Update as you hear back"
                body="Move the stage, log the interview, and keep the recruiter thread with the application."
              />
              <Step
                n="3"
                title="Open Folio when something is due"
                body="The dashboard is a short list: interviews tomorrow, deadlines this week, follow-ups you owe."
              />
            </ol>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-accent px-8 py-12 text-white sm:px-12">
            <h2 className="font-display max-w-xl text-3xl tracking-tight sm:text-4xl">
              Start tracking in a minute.
            </h2>
            <p className="mt-3 max-w-lg text-white/75 leading-7">
              Free to use, private to you, and ready for a real search — not a
              demo with fake data.
            </p>
            <div className="mt-8">
              {signedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-accent"
                >
                  Open dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-accent"
                >
                  Create your account
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-stone-500">
          <p>
            {APP_NAME} · internship and job search tracker
          </p>
          {signedIn ? (
            <Link href="/dashboard" className="font-medium text-accent">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="font-medium text-accent">
              Log in
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm font-medium">Dashboard</p>
        <p className="text-xs text-stone-500">Needs attention · 3</p>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-3">
        <PreviewStat label="Applications" value="18" />
        <PreviewStat label="Interviews" value="4" />
        <PreviewStat label="Offers" value="1" />
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <ul className="space-y-2 text-sm">
          <PreviewRow kind="Interview" title="Google · Technical" when="Tomorrow, 10:00 AM" />
          <PreviewRow kind="Deadline" title="Meta · SWE Intern" when="In 2 days" />
          <PreviewRow kind="Follow-up" title="Stripe recruiter" when="Sep 19" />
        </ul>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
            Stages
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {stages.map((stage) => (
              <span
                key={stage}
                className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-accent"
              >
                {stage}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-stone-500">
            Your live dashboard looks like this — interviews, deadlines, and
            follow-ups in one list.
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
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
    <li className="flex items-start justify-between gap-3 rounded-xl bg-[var(--background)] px-4 py-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
          {kind}
        </p>
        <p className="font-medium">{title}</p>
      </div>
      <p className="shrink-0 text-xs text-stone-500">{when}</p>
    </li>
  );
}

function Feature({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-accent">{number}</p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-white">
        {n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-stone-600">{body}</p>
      </div>
    </li>
  );
}
