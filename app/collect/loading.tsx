function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-p2p-border bg-p2p-surface shadow-card animate-pulse">
      <div className="aspect-video w-full bg-p2p-surface-warm" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 h-5 w-3/4 rounded bg-p2p-surface-warm" />
        <div className="mb-3 h-4 w-1/3 rounded-full bg-p2p-surface-warm" />
        <div className="mb-3 flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-p2p-surface-warm" />
          <div className="h-5 w-16 rounded-full bg-p2p-surface-warm" />
        </div>
        <div className="mb-4 h-4 w-2/3 rounded bg-p2p-surface-warm" />
        <div className="mt-auto flex items-center justify-between border-t border-p2p-border-subtle pt-3">
          <div className="h-4 w-20 rounded bg-p2p-surface-warm" />
          <div className="h-4 w-14 rounded bg-p2p-surface-warm" />
        </div>
      </div>
    </div>
  );
}

export default function CollectLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      {/* Heading skeleton */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-9 w-56 rounded-lg bg-p2p-surface-warm animate-pulse" />
          <div className="h-6 w-28 rounded-full bg-p2p-surface-warm animate-pulse" />
        </div>
        <div className="mt-2 h-5 w-80 rounded bg-p2p-surface-warm animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 rounded-full bg-p2p-surface-warm animate-pulse"
          />
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
