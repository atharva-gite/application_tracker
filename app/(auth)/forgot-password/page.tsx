import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/auth-header";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <AuthHeader
        title="Reset your password"
        description="Enter your email and we will send reset instructions if an account exists."
      />
      <div className="mt-6">
        <ForgotPasswordForm />
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
