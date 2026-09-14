import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-stone-600">
        Log in to pick up your search.
      </p>
      {params.reset ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Your password was updated. You can log in now.
        </p>
      ) : null}
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        <Link href="/forgot-password" className="font-medium text-accent">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-sm text-stone-600">
        New here?{" "}
        <Link href="/register" className="font-medium text-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
