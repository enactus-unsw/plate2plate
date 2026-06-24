"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Mail,
  Phone,
  MapPin,
  Package,
  XCircle,
  Loader2,
  AlertTriangle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { AllergenTag } from "@/components/shared/AllergenTag";
import { DietaryTag } from "@/components/shared/DietaryTag";
import { FOOD_CONDITION_LABELS } from "@/lib/constants";
import { closeListing, markCollected } from "@/lib/actions/listings";
import type { Listing, FoodCondition } from "@/types";

type CardState = "default" | "collected" | "closed";

const STATUS_CONFIG = {
  available: {
    label: "Live",
    className: "bg-p2p-primary-light text-p2p-primary",
  },
  held: {
    label: "Held — being collected",
    className: "bg-p2p-amber-light text-p2p-amber",
  },
  collected: {
    label: "Collected",
    className: "bg-p2p-primary-light text-p2p-primary",
  },
  unavailable: {
    label: "Closed",
    className: "bg-p2p-surface-warm text-p2p-text-secondary",
  },
} as const;

const STATE_BADGE_OVERRIDES: Record<
  Exclude<CardState, "default">,
  { label: string; className: string }
> = {
  collected: {
    label: "Collected",
    className: "bg-p2p-primary-light text-p2p-primary",
  },
  closed: {
    label: "Closed",
    className: "bg-p2p-surface-warm text-p2p-text-secondary",
  },
};

interface ManageListingCardProps {
  listing: Listing;
}

export function ManageListingCard({ listing }: ManageListingCardProps) {
  const [cardState, setCardState] = useState<CardState>("default");
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managementUrl = `food-compass.org/manage/${listing.management_token}`;

  const statusConfig =
    cardState !== "default"
      ? STATE_BADGE_OVERRIDES[cardState]
      : STATUS_CONFIG[listing.status];

  const isTerminal =
    listing.status === "unavailable" || listing.status === "collected";
  const isDisabled =
    cardState !== "default" || collectLoading || closeLoading || isTerminal;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(managementUrl);
    setCopied(true);
    toast("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCollect = async () => {
    setCollectDialogOpen(false);
    setCollectLoading(true);
    setError(null);

    try {
      const result = await markCollected(listing.management_token);
      if (result.error) {
        setError(result.error);
        return;
      }

      setCardState("collected");
      toast.success(
        "Marked as collected. Feedback email will be sent in 12 hours.",
      );
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setCollectLoading(false);
    }
  };

  const handleClose = async () => {
    setCloseDialogOpen(false);
    setCloseLoading(true);
    setError(null);

    try {
      const result = await closeListing(listing.management_token);
      if (result.error) {
        setError(result.error);
        return;
      }

      setCardState("closed");
      toast.success("Listing closed successfully.");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setCloseLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-p2p-border bg-p2p-surface p-5 shadow-card md:p-6">
      {/* Terminal state banners */}
      {cardState === "collected" && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-p2p-primary-light p-3">
          <Check size={18} className="shrink-0 text-p2p-primary" />
          <p className="text-sm font-medium text-p2p-primary">
            Marked as collected
          </p>
        </div>
      )}
      {cardState === "closed" && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-p2p-red-light p-3">
          <XCircle size={18} className="shrink-0 text-p2p-red" />
          <p className="text-sm font-medium text-p2p-red">Listing closed</p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg bg-p2p-red-light p-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-p2p-red" />
          <div className="flex-1">
            <p className="text-sm font-medium text-p2p-red">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 rounded-md p-0.5 text-p2p-red transition-colors hover:bg-p2p-red/10 focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2"
            aria-label="Dismiss error"
          >
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Title + status badge */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="font-sans text-xl font-semibold text-p2p-text">
          {listing.title}
        </h2>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Category + Condition badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-p2p-primary-light px-3 py-1 text-xs font-medium text-p2p-primary">
          {listing.food_category}
        </span>
        <span className="inline-flex items-center rounded-full bg-p2p-surface-warm px-3 py-1 text-xs font-medium text-p2p-text-secondary">
          {FOOD_CONDITION_LABELS[listing.food_condition as FoodCondition]}
        </span>
      </div>

      {/* Countdown */}
      <div className="mb-4">
        <CountdownTimer expiresAt={listing.expires_at} size="lg" />
      </div>

      {/* Quantity */}
      <div className="mb-4 flex items-center gap-2 text-base text-p2p-text">
        <Package size={16} className="shrink-0 text-p2p-primary" />
        <span>
          <span className="font-semibold">{listing.quantity_remaining}</span> of{" "}
          <span className="font-semibold">{listing.quantity}</span> servings
          remaining
        </span>
      </div>

      {/* Pickup location */}
      <div className="mb-4 flex items-start gap-2 text-base text-p2p-text">
        <MapPin size={16} className="mt-0.5 shrink-0 text-p2p-primary" />
        <span>{listing.pickup_location}</span>
      </div>

      {/* Allergens */}
      {listing.allergens.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-p2p-text-secondary">
            Allergens
          </p>
          <div className="flex flex-wrap gap-1.5">
            {listing.allergens.map((a) => (
              <AllergenTag key={a} allergen={a} />
            ))}
          </div>
        </div>
      )}

      {/* Dietary tags */}
      {listing.dietary_tags.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-p2p-text-secondary">
            Dietary
          </p>
          <div className="flex flex-wrap gap-1.5">
            {listing.dietary_tags.map((t) => (
              <DietaryTag key={t} tag={t} />
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="mb-4 space-y-1.5">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-p2p-text-secondary">
          Contact
        </p>
        <div className="flex items-center gap-2 text-sm text-p2p-text">
          <User size={14} className="shrink-0 text-p2p-text-secondary" />
          <span>{listing.contact_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-p2p-text">
          <Mail size={14} className="shrink-0 text-p2p-text-secondary" />
          <span>{listing.contact_email}</span>
        </div>
        {listing.contact_phone && (
          <div className="flex items-center gap-2 text-sm text-p2p-text">
            <Phone size={14} className="shrink-0 text-p2p-text-secondary" />
            <span>{listing.contact_phone}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {listing.notes && (
        <div className="mb-5 rounded-lg bg-p2p-surface-warm p-3">
          <p className="text-sm text-p2p-text-secondary">{listing.notes}</p>
        </div>
      )}

      <div className="mb-5 border-t border-p2p-border-subtle" />

      {/* Action buttons */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <AlertDialog
          open={collectDialogOpen}
          onOpenChange={setCollectDialogOpen}
        >
          <AlertDialogTrigger
            disabled={isDisabled}
            render={
              <Button
                size="lg"
                disabled={isDisabled}
                className="flex-1 bg-p2p-primary text-white transition-transform hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
              />
            }
          >
            {collectLoading && <Loader2 size={16} className="animate-spin" />}
            {collectLoading ? "Marking…" : "Mark as Collected"}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as collected?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark the listing as collected and close it. Students
                will no longer be able to claim it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCollect}>
                Yes, mark as collected
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
          <AlertDialogTrigger
            disabled={isDisabled}
            render={
              <Button
                variant="destructive"
                size="lg"
                disabled={isDisabled}
                className="flex-1 transition-transform active:scale-[0.98]"
              />
            }
          >
            {closeLoading && <Loader2 size={16} className="animate-spin" />}
            {closeLoading ? "Closing…" : "Close listing early"}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove your listing from the feed immediately.
                Students will no longer be able to claim it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClose}>
                Yes, close listing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-5 border-t border-p2p-border-subtle" />

      {/* Management link */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-p2p-text-secondary">
          Your management link — save this somewhere safe
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-p2p-border bg-p2p-surface-warm p-3">
          <code className="flex-1 truncate font-dm-mono text-sm text-p2p-text">
            {managementUrl}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md p-1.5 text-p2p-text-secondary transition-colors hover:bg-p2p-primary-light hover:text-p2p-primary focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
            aria-label="Copy management link"
          >
            {copied ? (
              <Check size={16} className="text-p2p-primary" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
