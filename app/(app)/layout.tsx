import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/server/services/auth-service";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getCurrentUser(session.user.id);
  return (
    <AppShell userName={user.name ?? user.email}>
      {children}
    </AppShell>
  );
}
