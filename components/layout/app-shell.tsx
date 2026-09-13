import type { ReactNode } from "react";
import Link from "next/link";

import { logoutAction } from "@/server/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", enabled: true },
  { href: "/applications", label: "Applications", enabled: false },
  { href: "/interviews", label: "Interviews", enabled: false },
  { href: "/companies", label: "Companies", enabled: false },
];

export function AppShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="px-6 py-5 text-lg font-semibold tracking-tight">Pipeline</div>
          <nav className="space-y-1 px-3">
            {navItems.map((item) =>
              item.enabled ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-stone-800 hover:bg-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-stone-400"
                >
                  {item.label}
                  <span className="text-xs">Soon</span>
                </span>
              ),
            )}
          </nav>
        </div>
        <div className="border-t border-border p-4">
          <p className="truncate text-sm font-medium">{userName}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-2 text-sm text-stone-600 hover:text-stone-900"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-full flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <p className="font-semibold">Pipeline</p>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-stone-600">
              Log out
            </button>
          </form>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
