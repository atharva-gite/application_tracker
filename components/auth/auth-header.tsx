export function AuthHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="font-display text-[2rem] leading-[1.12] tracking-tight text-foreground sm:text-[2.5rem]">
        {title}
      </h1>
      <p className="mt-2.5 font-display text-[1.0625rem] leading-6 text-[#58564f] italic">
        {description}
      </p>
      <div className="mt-5 h-px w-9 bg-accent/40" aria-hidden />
    </div>
  );
}

export function AuthAlert({
  id,
  tone = "danger",
  children,
}: {
  id?: string;
  tone?: "danger" | "success";
  children: string;
}) {
  const danger = tone === "danger";

  return (
    <p
      id={id}
      role={danger ? "alert" : "status"}
      className={`border-l-[3px] pl-3 text-sm leading-5 ${
        danger
          ? "border-[var(--danger)] text-[var(--danger)]"
          : "border-accent text-accent"
      }`}
    >
      {children}
    </p>
  );
}

export function AuthSubmit({
  pending,
  pendingLabel,
  children,
  describedBy,
}: {
  pending: boolean;
  pendingLabel: string;
  children: string;
  describedBy?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-describedby={describedBy}
      className="btn-primary relative h-[3.125rem] w-full text-[0.9375rem] transition-colors"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="auth-spinner" aria-hidden />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
