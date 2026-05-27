import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-p2p-primary-light p-5">
        <SearchX size={40} className="text-p2p-primary-mid" strokeWidth={1.5} />
      </div>
      <h1 className="mb-3 font-heading text-3xl font-semibold text-p2p-text heading-tight">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-base text-p2p-text-secondary body-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/collect"
        className="inline-flex h-11 items-center rounded-lg bg-p2p-primary px-6 text-sm font-semibold text-white transition-transform transition-colors hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        Go to collect feed
      </Link>
    </div>
  );
}
