import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ListingFeed } from "@/components/listings/ListingFeed";
import { ListingFeedRealtime } from "@/components/listings/ListingFeedRealtime";
import { normalizePhotoUrls } from "@/lib/utils/normalize-photo-urls";
import { CollectFilters } from "./filters";
import type { Listing } from "@/types";

interface SearchParams {
  vegetarian?: string;
  vegan?: string;
  halal?: string;
  gluten_free?: string;
  category?: string;
  available_now?: string;
}

function hasFilters(sp: SearchParams): boolean {
  return !!(
    sp.vegetarian === "true" ||
    sp.vegan === "true" ||
    sp.halal === "true" ||
    sp.gluten_free === "true" ||
    (sp.category && sp.category !== "All categories") ||
    sp.available_now === "true"
  );
}

async function ListingsLoader({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*")
    .in("status", ["available", "held"])
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const dietaryFilters: string[] = [];
  if (searchParams.vegetarian === "true") dietaryFilters.push("vegetarian");
  if (searchParams.vegan === "true") dietaryFilters.push("vegan");
  if (searchParams.halal === "true") dietaryFilters.push("halal");
  if (searchParams.gluten_free === "true") dietaryFilters.push("gluten-free");

  for (const tag of dietaryFilters) {
    query = query.contains("dietary_tags", [tag]);
  }

  if (searchParams.category && searchParams.category !== "All categories") {
    query = query.eq("food_category", searchParams.category);
  }

  if (searchParams.available_now === "true") {
    query = query.gt("expires_at", new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-base text-p2p-text-secondary">
          Something went wrong loading listings. Please refresh.
        </p>
      </div>
    );
  }

  const raw = (data ?? []) as Listing[];
  const listings = raw.map((l) => ({
    ...l,
    photo_urls: normalizePhotoUrls(l.photo_urls, l.photo_url),
  })) as Listing[];
  return (
    <ListingFeedRealtime
      initialListings={listings}
      hasActiveFilters={hasFilters(searchParams)}
    />
  );
}

function LoadingSkeleton() {
  return <ListingFeed listings={[]} loading />;
}

export default async function CollectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 md:py-24 lg:px-8">
      {/* Page heading */}
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-p2p-text heading-tight md:text-4xl">
            Available Food
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-p2p-primary-light px-2.5 py-1 text-xs font-medium text-p2p-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-p2p-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-p2p-primary" />
            </span>
            Updated live
          </span>
        </div>
        <p className="text-base text-p2p-text-secondary">
          Claim untouched surplus food from UNSW events — for free.
        </p>
      </div>

      {/* Filter bar (client component) */}
      <CollectFilters />

      {/* Feed */}
      <Suspense fallback={<LoadingSkeleton />}>
        <ListingsLoader searchParams={params} />
      </Suspense>
    </div>
  );
}
