"use client";

import { useActionState } from "react";

import { updateProfileAction, type AuthFormState } from "@/server/actions/auth";

const initialState: AuthFormState = {};

export function ProfileForm({
  name,
  timezone,
  timezones,
}: {
  name: string;
  timezone: string;
  timezones: string[];
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={action} className="card space-y-4 p-6">
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-stone-800">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          required
          autoComplete="name"
          className="input"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="mt-1 text-sm text-[var(--danger)]">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="timezone" className="mb-1 block text-sm font-medium text-stone-800">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={timezone}
          className="input"
        >
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-stone-500">
          Deadlines, follow-ups, and stalled applications use this timezone.
        </p>
        {state.fieldErrors?.timezone?.[0] ? (
          <p className="mt-1 text-sm text-[var(--danger)]">{state.fieldErrors.timezone[0]}</p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
