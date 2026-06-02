function FieldSkeleton({ wide = true }: { wide?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 h-4 w-28 rounded bg-p2p-surface-warm animate-pulse" />
      <div
        className={`h-10 rounded-lg bg-p2p-surface-warm animate-pulse ${wide ? "w-full" : "w-1/2"}`}
      />
    </div>
  );
}

function SectionSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="rounded-xl border border-p2p-border bg-p2p-surface shadow-card p-5 md:p-6 animate-pulse">
      <div className="mb-4 h-5 w-36 rounded bg-p2p-surface-warm" />
      <div className="space-y-4 md:space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <FieldSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function RedistributeLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Heading skeleton */}
        <div className="mb-10 md:mb-12">
          <div className="h-9 w-64 rounded-lg bg-p2p-surface-warm animate-pulse" />
          <div className="mt-3 h-5 w-full max-w-md rounded bg-p2p-surface-warm animate-pulse" />
        </div>

        <div className="space-y-6">
          <SectionSkeleton fields={3} />
          <SectionSkeleton fields={2} />
          <SectionSkeleton fields={2} />
          <SectionSkeleton fields={2} />

          {/* Safety checkbox skeleton */}
          <div className="rounded-xl border-2 border-p2p-border bg-p2p-surface shadow-card p-5 md:p-6 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 shrink-0 rounded bg-p2p-surface-warm" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-p2p-surface-warm" />
                <div className="h-4 w-full rounded bg-p2p-surface-warm" />
              </div>
            </div>
          </div>

          {/* Submit button skeleton */}
          <div className="h-12 w-full rounded-lg bg-p2p-surface-warm animate-pulse" />
        </div>
      </div>
    </div>
  );
}
