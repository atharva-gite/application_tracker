"use client";

import { useActionState, useId } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthAlert, AuthSubmit } from "@/components/auth/auth-header";
import { registerAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  const formErrorId = useId();

  return (
    <form
      action={(formData) => {
        formData.set(
          "timezone",
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        );
        return action(formData);
      }}
      className="flex flex-col"
      aria-busy={pending}
    >
      <div className="space-y-4">
        <AuthField
          id="name"
          name="name"
          label="Name"
          type="text"
          autoComplete="name"
          error={state.fieldErrors?.name?.[0]}
        />
        <AuthField
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={state.fieldErrors?.email?.[0]}
        />
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={state.fieldErrors?.password?.[0]}
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
          pendingLabel="Creating account…"
          describedBy={state.message ? formErrorId : undefined}
        >
          Create account
        </AuthSubmit>
      </div>
    </form>
  );
}
