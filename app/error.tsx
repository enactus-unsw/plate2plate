"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-p2p-amber-light p-5">
        <AlertTriangle size={40} className="text-p2p-amber" strokeWidth={1.5} />
      </div>
      <h1 className="mb-3 font-heading text-3xl font-semibold text-p2p-text heading-tight">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-md text-base text-p2p-text-secondary body-relaxed">
        Try refreshing the page. If the problem persists, come back in a few
        minutes.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex h-11 items-center rounded-lg bg-p2p-primary px-6 text-sm font-semibold text-white transition-transform transition-colors hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Refresh page
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg border border-p2p-border bg-p2p-surface px-6 text-sm font-semibold text-p2p-text transition-transform transition-colors hover:bg-p2p-primary-light focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
