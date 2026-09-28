import type { Metadata } from "next";
import Link from "next/link";

import { AuthAlert, AuthHeader } from "@/components/auth/auth-header";
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
      <AuthHeader
        title="Welcome back"
        description="Pick up where you left off."
      />
      {params.reset ? (
        <div className="mt-6">
          <AuthAlert tone="success">
            Your password was updated. You can log in now.
          </AuthAlert>
        </div>
      ) : null}
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-6 text-[0.9375rem] text-stone-600">
        New to Folio?{" "}
        <Link
          href="/register"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
      <p className="mt-8 text-[0.8125rem] leading-5 text-stone-400">
        Your applications and job-search data stay private.
      </p>
    </div>
  );
}
