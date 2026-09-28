"use client";

import { useActionState, useId } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthAlert, AuthSubmit } from "@/components/auth/auth-header";
import { resetPasswordAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const formErrorId = useId();

  if (!token) {
    return (
      <AuthAlert>
        This reset link is missing a token. Request a new password reset email.
      </AuthAlert>
    );
  }

  return (
    <form action={action} className="flex flex-col" aria-busy={pending}>
      <input type="hidden" name="token" value={token} />
      <AuthField
        id="password"
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={state.fieldErrors?.password?.[0]}
      />

      <div className="mt-4">
        {state.message ? (
          <div className="mb-3" aria-live="polite">
            <AuthAlert id={formErrorId}>{state.message}</AuthAlert>
          </div>
        ) : null}
        <AuthSubmit
          pending={pending}
          pendingLabel="Updating…"
          describedBy={state.message ? formErrorId : undefined}
        >
          Update password
        </AuthSubmit>
      </div>
    </form>
  );
}
