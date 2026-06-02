export default function ManageLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      {/* Back link skeleton */}
      <div className="mb-6 h-4 w-16 rounded bg-p2p-surface-warm animate-pulse" />

      {/* Heading skeleton */}
      <div className="mb-2 h-7 w-52 rounded-lg bg-p2p-surface-warm animate-pulse" />
      <div className="mb-8 h-4 w-72 rounded bg-p2p-surface-warm animate-pulse" />

      {/* Card skeleton */}
      <div className="max-w-2xl rounded-xl border border-p2p-border bg-p2p-surface p-5 shadow-card md:p-6 animate-pulse">
        {/* Title + badge */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="h-6 w-48 rounded bg-p2p-surface-warm" />
          <div className="h-6 w-16 rounded-full bg-p2p-surface-warm" />
        </div>

        {/* Category badges */}
        <div className="mb-4 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-p2p-surface-warm" />
          <div className="h-6 w-28 rounded-full bg-p2p-surface-warm" />
        </div>

        {/* Countdown */}
        <div className="mb-4 h-5 w-24 rounded bg-p2p-surface-warm" />

        {/* Quantity */}
        <div className="mb-4 h-5 w-44 rounded bg-p2p-surface-warm" />

        {/* Location */}
        <div className="mb-4 h-5 w-56 rounded bg-p2p-surface-warm" />

        {/* Tags */}
        <div className="mb-4 flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-p2p-surface-warm" />
          <div className="h-5 w-16 rounded-full bg-p2p-surface-warm" />
        </div>

        {/* Contact */}
        <div className="mb-4 space-y-2">
          <div className="h-3 w-16 rounded bg-p2p-surface-warm" />
          <div className="h-4 w-44 rounded bg-p2p-surface-warm" />
        </div>

        <div className="mb-5 border-t border-p2p-border-subtle" />

        {/* Action buttons */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="h-11 flex-1 rounded-lg bg-p2p-surface-warm" />
          <div className="h-11 flex-1 rounded-lg bg-p2p-surface-warm" />
        </div>

        <div className="mb-5 border-t border-p2p-border-subtle" />

        {/* Management link */}
        <div className="h-3 w-56 rounded bg-p2p-surface-warm mb-2" />
        <div className="h-12 w-full rounded-lg bg-p2p-surface-warm" />
      </div>
    </div>
  );
}
