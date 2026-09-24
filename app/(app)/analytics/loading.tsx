export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-4">
      <div className="h-8 w-40 rounded bg-stone-200" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 rounded-2xl bg-stone-200" />
        <div className="h-28 rounded-2xl bg-stone-200" />
        <div className="h-28 rounded-2xl bg-stone-200" />
      </div>
      <div className="h-48 rounded-2xl bg-stone-200" />
    </div>
  );
}
