import type { Metadata } from "next";

import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="mt-2 text-stone-600">
        You are signed in. This is the workspace where your applications,
        interviews, and follow-ups will appear.
      </p>

      <section className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-6">
        <h2 className="text-lg font-medium">No applications yet</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Application tracking is next. Once it is available, you will add a
          company, role, and status here, and this dashboard will show what
          needs attention.
        </p>
      </section>
    </div>
  );
}
