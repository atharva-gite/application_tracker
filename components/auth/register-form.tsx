"use client";

import { useActionState } from "react";

import { registerAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}

      <Field
        id="name"
        name="name"
        label="Name"
        type="text"
        autoComplete="name"
        error={state.fieldErrors?.name?.[0]}
      />
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
        autoComplete="new-password"
        hint="At least 8 characters."
        error={state.fieldErrors?.password?.[0]}
      />

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
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
  hint,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  hint?: string;
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
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
      />
      {error ? (
        <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}
