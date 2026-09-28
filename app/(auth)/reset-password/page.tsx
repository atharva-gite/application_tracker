import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/auth-header";
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
      <AuthHeader
        title="Choose a new password"
        description="Use the link from your email to set a new password."
      />
      <div className="mt-6">
        <ResetPasswordForm token={params.token ?? ""} />
      </div>
      <p className="mt-6 text-[0.9375rem] text-stone-600">
        <Link
          href="/login"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
