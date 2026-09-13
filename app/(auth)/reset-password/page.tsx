import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mt-1 text-sm text-stone-600">
        Use the link from your email to set a new password.
      </p>
      <div className="mt-6">
        <ResetPasswordForm token={params.token ?? ""} />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        <Link href="/login" className="font-medium text-accent">
          Back to login
        </Link>
      </p>
    </div>
  );
}
