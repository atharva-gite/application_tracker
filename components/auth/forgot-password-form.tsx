"use client";

import { useActionState } from "react";

import {
  forgotPasswordAction,
  type AuthFormState,
} from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      {state.message && !state.fieldErrors ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.message}
        </p>
      ) : null}
      {state.message && state.fieldErrors ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="mt-1 text-sm text-[var(--danger)]">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset instructions"}
      </button>
    </form>
  );
}
