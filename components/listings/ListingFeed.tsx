"use client";

import { UtensilsCrossed, SlidersHorizontal } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Listing } from "@/types";

interface ListingFeedProps {
  listings: Listing[];
  loading?: boolean;
  hasActiveFilters?: boolean;
}

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

export function ListingFeed({ listings, loading = false, hasActiveFilters = false }: ListingFeedProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0 && hasActiveFilters) {
    return (
      <EmptyState
        icon={SlidersHorizontal}
        heading="No listings match your filters"
        subtext="Try removing some filters to see more results."
      />
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        heading="No food available right now"
        subtext="Check back soon — listings update in real time."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
