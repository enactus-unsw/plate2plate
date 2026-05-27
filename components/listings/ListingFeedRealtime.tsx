"use client";

import { useRealtimeListings } from "@/hooks/use-realtime-listings";
import { ListingFeed } from "@/components/listings/ListingFeed";
import type { Listing } from "@/types";

interface ListingFeedRealtimeProps {
  initialListings: Listing[];
  hasActiveFilters?: boolean;
}

export function ListingFeedRealtime({
  initialListings,
  hasActiveFilters = false,
}: ListingFeedRealtimeProps) {
  const { listings, lastEventAt } = useRealtimeListings(initialListings);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span
            key={lastEventAt}
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-p2p-primary opacity-75"
          />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-p2p-primary/70" />
        </span>
        <span className="text-xs font-medium text-p2p-text-secondary">
          Live updates
        </span>
      </div>

      <ListingFeed listings={listings} hasActiveFilters={hasActiveFilters} />
    </div>
  );
}
