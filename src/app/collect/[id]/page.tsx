import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { AllergenTag } from "@/components/shared/AllergenTag";
import { DietaryTag } from "@/components/shared/DietaryTag";
import { ClaimForm } from "@/components/listings/ClaimForm";
import { PhotoGallery } from "@/components/listings/PhotoGallery";
import { FOOD_CONDITION_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { normalizePhotoUrls } from "@/lib/utils/normalize-photo-urls";
import type { Listing, FoodCondition } from "@/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatExpiryDate(iso: string): string {
  const d = new Date(iso);
  const day = WEEKDAYS[d.getDay()];
  const date = d.getDate();
  const month = MONTHS[d.getMonth()];
  const hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${mins} ${period} — ${day}, ${date} ${month}`;
}

function getDonorName(email: string): string {
  return email.split("@")[0];
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .in("status", ["available", "held"])
    .single();

  if (error || !data) {
    notFound();
  }

  const listing = {
    ...data,
    photo_urls: normalizePhotoUrls(data.photo_urls, data.photo_url),
  } as Listing;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 md:py-24 lg:px-8">
      {/* Back button */}
      <Link
        href="/collect"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium sm:mb-8 text-p2p-text-secondary transition-transform hover:text-p2p-primary focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <ArrowLeft size={16} />
        Back to listings
      </Link>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
        {/* Left column — detail */}
        <div className="lg:col-span-3">
          {/* Photo gallery */}
          <div className="mb-6">
            <PhotoGallery images={listing.photo_urls} title={listing.title} />
          </div>

          {/* Title */}
          <h1 className="mb-2 font-heading text-2xl font-semibold text-p2p-text heading-tight md:text-3xl">
            {listing.title}
          </h1>

          {/* Donor */}
          <p className="mb-4 text-sm text-p2p-text-secondary">
            Posted by{" "}
            <span className="font-medium text-p2p-text">
              {getDonorName(listing.contact_email)}
            </span>
          </p>

          {/* Badges */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-p2p-primary-light px-3 py-1 text-xs font-medium text-p2p-primary">
              {listing.food_category}
            </span>
            <span className="inline-flex items-center rounded-full bg-p2p-surface-warm px-3 py-1 text-xs font-medium text-p2p-text-secondary">
              {FOOD_CONDITION_LABELS[listing.food_condition as FoodCondition]}
            </span>
          </div>

          {/* Countdown */}
          <div className="mb-5">
            <CountdownTimer expiresAt={listing.expires_at} size="lg" />
          </div>

          {/* Quantity */}
          <p className="mb-5 text-base text-p2p-text">
            <span className="font-semibold">{listing.quantity_remaining}</span>{" "}
            of <span className="font-semibold">{listing.quantity}</span>{" "}
            servings still available
          </p>

          {/* Pickup location */}
          <div className="mb-6 flex items-start gap-2 text-base text-p2p-text">
            <MapPin size={18} className="mt-0.5 shrink-0 text-p2p-primary" />
            <span>{listing.pickup_location}</span>
          </div>

          {/* Allergens section */}
          <div className="mb-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-p2p-text-secondary">
              Allergens
            </h3>
            {listing.allergens.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {listing.allergens.map((allergen) => (
                  <AllergenTag key={allergen} allergen={allergen} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-p2p-text-disabled">None listed</p>
            )}
          </div>

          {/* Dietary info section */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-p2p-text-secondary">
              Dietary info
            </h3>
            {listing.dietary_tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {listing.dietary_tags.map((tag) => (
                  <DietaryTag key={tag} tag={tag} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-p2p-text-disabled">Not specified</p>
            )}
          </div>

          {/* Safety note */}
          <div className="rounded-lg bg-p2p-primary-light p-4">
            <p className="flex items-start gap-2 text-sm text-p2p-primary">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              This food has been confirmed untouched and safely handled by the
              posting society.
            </p>
          </div>
        </div>

        {/* Right column — pickup details + claim form */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            {/* Pickup details card */}
            <div className="rounded-xl border border-p2p-border bg-p2p-surface p-6 shadow-card">
              <h3 className="mb-4 text-lg font-semibold text-p2p-text">
                Pickup Details
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-p2p-primary"
                  />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-p2p-text-secondary">
                      Where
                    </p>
                    <p className="text-sm font-medium text-p2p-text">
                      {listing.pickup_location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock
                    size={16}
                    className="mt-0.5 shrink-0 text-p2p-primary"
                  />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-p2p-text-secondary">
                      Available until
                    </p>
                    <p className="text-sm font-medium text-p2p-text">
                      {formatExpiryDate(listing.expires_at)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-p2p-border-subtle pt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-p2p-text-secondary">
                    Contact the donor
                  </p>
                  <div className="space-y-1.5">
                    <a
                      href={`mailto:${listing.contact_email}`}
                      className="flex items-center gap-2 text-sm text-p2p-primary transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2"
                    >
                      <Mail size={14} className="shrink-0" />
                      {listing.contact_email}
                    </a>
                    {listing.contact_phone && (
                      <a
                        href={`tel:${listing.contact_phone}`}
                        className="flex items-center gap-2 text-sm text-p2p-primary transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2"
                      >
                        <Phone size={14} className="shrink-0" />
                        {listing.contact_phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ClaimForm listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
}
