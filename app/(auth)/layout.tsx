import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="px-6 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Pipeline
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
