import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="px-6 py-5">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-16 pt-4">
        <div className="card w-full max-w-md p-7">{children}</div>
      </main>
    </div>
  );
}
