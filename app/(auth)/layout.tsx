import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="px-5 py-4 sm:px-10 sm:py-6">
        <Logo mark="plain" />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-12 pt-2 sm:px-8">
        <div className="w-full max-w-[26.75rem] sm:-translate-y-6">{children}</div>
      </main>
    </div>
  );
}
