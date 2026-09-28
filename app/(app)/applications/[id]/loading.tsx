export default function ApplicationDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-8">
      <div className="h-4 w-28 rounded bg-stone-200" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-stone-200" />
          <div className="h-8 w-72 rounded bg-stone-200" />
          <div className="h-6 w-20 rounded-full bg-stone-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded-lg bg-stone-200" />
          <div className="h-10 w-20 rounded-lg bg-stone-200" />
        </div>
      </div>
      <div className="h-24 rounded-2xl bg-stone-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-stone-200" />
        <div className="h-64 rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}
