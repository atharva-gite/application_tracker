import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/auth-header";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div>
      <AuthHeader
        title="Create your account"
        description="Start tracking applications, interviews, and follow-ups."
      />
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-[0.9375rem] text-stone-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
