import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-stone-600">
        Start tracking applications, interviews, and follow-ups.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent">
          Log in
        </Link>
      </p>
    </div>
  );
}
