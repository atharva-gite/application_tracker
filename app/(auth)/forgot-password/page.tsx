import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Reset your password</h1>
      <p className="mt-1 text-sm text-stone-600">
        Enter your email and we will send reset instructions if an account exists.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        <Link href="/login" className="font-medium text-accent">
          Back to login
        </Link>
      </p>
    </div>
  );
}
