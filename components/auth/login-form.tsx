"use client";

import { useActionState } from "react";

import { loginAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}

      <Field
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password?.[0]}
      />

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type,
  autoComplete,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-800">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="input"
      />
      {error ? <p className="mt-1 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
