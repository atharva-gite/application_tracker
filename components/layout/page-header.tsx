import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  kicker,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  kicker?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {kicker ? (
          <div className="mb-1.5 text-sm text-stone-500">{kicker}</div>
        ) : null}
        <h1 className="font-display text-[2rem] leading-[1.12] tracking-tight text-foreground sm:text-[2.25rem]">
          {title}
        </h1>
        {description ? (
          <div className="mt-2 max-w-xl text-[0.9375rem] leading-6 text-stone-600">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
