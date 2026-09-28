"use client";

import { useState, type ReactNode } from "react";

export function AuthField({
  id,
  name,
  label,
  type,
  autoComplete,
  error,
  hint,
  extraLabel,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  error?: string;
  hint?: string;
  extraLabel?: ReactNode;
  defaultValue?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, !error && hint ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.8125rem] font-medium text-stone-800">
          {label}
        </label>
        {extraLabel}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          autoCapitalize={type === "email" ? "none" : undefined}
          autoCorrect={type === "email" ? "off" : undefined}
          spellCheck={type === "email" ? false : undefined}
          inputMode={type === "email" ? "email" : undefined}
          required
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`input auth-input ${isPassword ? "pr-16" : ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-[0.8125rem] font-medium text-stone-500 hover:text-foreground"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[0.8125rem] text-stone-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
