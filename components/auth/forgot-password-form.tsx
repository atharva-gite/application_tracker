"use client";

import { useActionState, useId } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthAlert, AuthSubmit } from "@/components/auth/auth-header";
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
  const formErrorId = useId();
  const success = Boolean(state.message && !state.fieldErrors);

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
      </div>

      <div className="mt-4">
        {state.message ? (
          <div className="mb-3" aria-live="polite">
            <AuthAlert id={formErrorId} tone={success ? "success" : "danger"}>
              {state.message}
            </AuthAlert>
          </div>
        ) : null}
        <AuthSubmit
          pending={pending}
          pendingLabel="Sending…"
          describedBy={state.message ? formErrorId : undefined}
        >
          Send reset instructions
        </AuthSubmit>
      </div>
    </form>
  );
}
