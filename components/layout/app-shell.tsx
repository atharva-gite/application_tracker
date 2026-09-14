import type { ReactNode } from "react";
import Link from "next/link";

import { Logo, initials } from "@/components/brand/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { logoutAction } from "@/server/actions/auth";

export function AppShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-full lg:grid lg:grid-cols-[17.5rem_1fr]">
      <aside className="hidden border-r border-border/80 bg-surface/95 lg:flex lg:flex-col lg:justify-between">
        <div className="px-4 pt-6">
          <div className="px-2">
            <Logo href="/dashboard" />
          </div>
          <Link href="/applications/new" className="btn-primary mt-6 w-full">
            Add application
          </Link>
          <nav className="mt-6 space-y-1">
            <NavLinks variant="side" />
          </nav>
        </div>
        <div className="border-t border-border p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-accent">
              {initials(userName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
              <form action={logoutAction}>
                <button type="submit" className="mt-0.5 text-sm text-stone-500 hover:text-stone-900">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Logo href="/dashboard" size="sm" />
            <div className="flex items-center gap-2">
              <Link href="/applications/new" className="btn-primary px-3 py-1.5 text-xs">
                Add
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-sm text-stone-600">
                  Log out
                </button>
              </form>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm">
            <NavLinks variant="mobile" />
          </nav>
        </header>
        <main className="flex-1 px-5 py-8 sm:px-10 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
