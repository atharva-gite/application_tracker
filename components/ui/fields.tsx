export function Field({
  id,
  name,
  label,
  type = "text",
  error,
  defaultValue,
  required,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  error?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
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
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="input"
      />
      {error ? <p className="mt-1 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}

export function SelectField({
  id,
  name,
  label,
  error,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-800">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="input"
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  error,
  defaultValue,
  rows = 4,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-800">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="input"
      />
      {error ? <p className="mt-1 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  idle,
}: {
  pending: boolean;
  children?: React.ReactNode;
  idle: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary"
    >
      {pending ? children ?? "Saving…" : idle}
    </button>
  );
}
