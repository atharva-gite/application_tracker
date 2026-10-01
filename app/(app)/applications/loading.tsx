export default function ApplicationsLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-9 w-48 rounded bg-[var(--border)]" />
        <div className="h-4 w-40 rounded bg-[var(--border)]" />
      </div>
      <div className="h-16 border-y border-border" />
      <div className="overflow-hidden border-y border-border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <div className="h-4 rounded bg-[var(--border)]" />
            <div className="h-4 rounded bg-[var(--border)]" />
            <div className="h-4 w-20 rounded bg-[var(--border)]" />
            <div className="h-4 w-16 rounded bg-[var(--border)]" />
            <div className="h-4 w-20 rounded bg-[var(--border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
