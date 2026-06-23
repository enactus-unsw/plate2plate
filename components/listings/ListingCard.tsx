"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { AllergenTag } from "@/components/shared/AllergenTag";
import { DietaryTag } from "@/components/shared/DietaryTag";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const fullyReserved = listing.quantity_remaining <= 0;

  return (
    <Link href={`/collect/${listing.id}`} className="block outline-none">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-p2p-border bg-p2p-surface shadow-card transition-shadow transition-transform duration-200 ease-out-expo hover:shadow-card-hover hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]">
        {/* Photo */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
          <Image
            src={listing.photo_url || "/placeholder-food.png"}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {fullyReserved && (
            <div className="absolute right-3 top-3 inline-flex items-center rounded-full bg-p2p-amber-light px-2.5 py-1 text-xs font-medium text-p2p-amber">
              Fully Reserved
            </div>
          )}

          {Array.isArray(listing.photo_urls) &&
            listing.photo_urls.length > 1 && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                {listing.photo_urls.length} photos
              </div>
            )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 text-lg font-semibold text-p2p-text line-clamp-2">
            {listing.title}
          </h3>

          {/* Category badge */}
          <span className="mb-3 inline-flex w-fit items-center rounded-full bg-p2p-primary-light px-2.5 py-0.5 text-xs font-medium text-p2p-primary">
            {listing.food_category}
          </span>

          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {listing.allergens.map((allergen) => (
              <AllergenTag key={allergen} allergen={allergen} />
            ))}
            {listing.dietary_tags.map((tag) => (
              <DietaryTag key={tag} tag={tag} />
            ))}
          </div>

          {/* Location */}
          <div className="mb-4 flex items-start gap-1.5 text-sm text-p2p-text-secondary">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">{listing.pickup_location}</span>
          </div>

          {/* Bottom row */}
          <div className="mt-auto flex items-center justify-between border-t border-p2p-border-subtle pt-3">
            {fullyReserved ? (
              <span className="text-sm font-medium text-p2p-amber">
                All servings reserved
              </span>
            ) : (
              <span className="text-sm text-p2p-text-secondary">
                <span className="font-semibold text-p2p-text">
                  {listing.quantity_remaining}
                </span>{" "}
                of {listing.quantity} left
              </span>
            )}
            <CountdownTimer expiresAt={listing.expires_at} />
          </div>
        </div>
      </article>
    </Link>
  );
}
