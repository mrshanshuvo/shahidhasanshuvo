export function SectionSkeleton({ cols = 3 }: { cols?: number }) {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-5 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Card grid skeleton */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""} gap-8`}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-slate-900/40"
            >
              <div className="space-y-4 p-8">
                <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="bg-slate-50 py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-5 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 pt-2">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-5 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 rounded-3xl border border-slate-200 bg-slate-100 p-6 dark:border-white/5 dark:bg-slate-900/40"
            >
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
