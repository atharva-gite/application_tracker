import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-accent px-12 py-12 text-white lg:flex">
        <Logo tone="light" />
        <div className="max-w-md">
          <p className="font-display text-4xl leading-tight tracking-tight">
            {APP_TAGLINE}
          </p>
          <p className="mt-5 text-base leading-7 text-white/70">
            Interviews, deadlines, and follow-ups stay with the application —
            not in a spreadsheet you stop opening.
          </p>
        </div>
        <p className="text-sm text-white/50">
          {APP_NAME} is private by default. Built for students in an active
          search.
        </p>
      </aside>
      <div className="flex min-h-full flex-col bg-background">
        <header className="px-6 py-5 lg:hidden">
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
