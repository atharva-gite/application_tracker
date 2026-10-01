export default function ApplicationDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-8">
      <div className="h-4 w-28 rounded bg-[var(--border)]" />
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-[var(--border)]" />
        <div className="h-9 w-72 rounded bg-[var(--border)]" />
        <div className="h-6 w-20 rounded-full bg-[var(--border)]" />
      </div>
      <div className="h-8 w-full max-w-md rounded bg-[var(--border)]" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-48 border-t border-border" />
        <div className="h-48 border-t border-border" />
      </div>
    </div>
  );
}
