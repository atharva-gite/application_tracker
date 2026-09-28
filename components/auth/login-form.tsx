"use client";

import Link from "next/link";
import { useActionState, useId } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthAlert, AuthSubmit } from "@/components/auth/auth-header";
import { loginAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const formErrorId = useId();

  return (
    <form action={action} className="flex flex-col" aria-busy={pending}>
      <div className="space-y-4">
        <AuthField
          id="email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={state.fieldErrors?.email?.[0]}
        />
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={state.fieldErrors?.password?.[0]}
          extraLabel={
            <Link
              href="/forgot-password"
              className="text-[0.8125rem] font-medium text-accent underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
        />
      </div>

      <div className="mt-4">
        {state.message ? (
          <div className="mb-3" aria-live="polite">
            <AuthAlert id={formErrorId}>{state.message}</AuthAlert>
          </div>
        ) : null}
        <AuthSubmit
          pending={pending}
          pendingLabel="Logging in…"
          describedBy={state.message ? formErrorId : undefined}
        >
          Log in
        </AuthSubmit>
      </div>
    </form>
  );
}
