export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 md:p-8">
      {/* Top Toolbar Skeleton */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center dark:border-white/5 dark:bg-slate-900/40">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Main List Container Skeleton */}
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-900/40">
        <div className="mb-6 space-y-2">
          <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-72 rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-slate-900/40"
            >
              <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
