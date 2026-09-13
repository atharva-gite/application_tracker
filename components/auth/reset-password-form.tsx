"use client";

import { useActionState } from "react";

import { resetPasswordAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  if (!token) {
    return (
      <p className="text-sm text-[var(--danger)]">
        This reset link is missing a token. Request a new password reset email.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="mt-1 text-sm text-[var(--danger)]">
            {state.fieldErrors.password[0]}
          </p>
        ) : (
          <p className="mt-1 text-xs text-stone-500">At least 8 characters.</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
