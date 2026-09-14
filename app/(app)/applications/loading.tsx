export default function ApplicationsLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-stone-200" />
          <div className="h-4 w-40 rounded bg-stone-200" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-stone-200" />
      </div>
      <div className="h-24 rounded-2xl bg-stone-200" />
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <div className="h-4 rounded bg-stone-200" />
            <div className="h-4 rounded bg-stone-200" />
            <div className="h-4 w-20 rounded bg-stone-200" />
            <div className="h-4 w-16 rounded bg-stone-200" />
            <div className="h-4 w-20 rounded bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
