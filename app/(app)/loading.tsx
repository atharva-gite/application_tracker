export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-10">
      <div className="space-y-2">
        <div className="h-9 w-56 rounded bg-[var(--border)]" />
        <div className="h-4 w-72 rounded bg-[var(--border)]" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-[var(--border)]" />
        <div className="h-24 border-y border-border" />
      </div>
      <div className="h-28 border-y border-border" />
    </div>
  );
}
