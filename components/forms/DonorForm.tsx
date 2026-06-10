"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  createListing,
  createPhotoUploadTargets,
} from "@/lib/actions/listings";
import { createClient } from "@/lib/supabase/client";
import {
  listingSchema,
  type ListingFormValues,
} from "@/lib/validations/listing.schema";
import {
  FOOD_CATEGORIES,
  FOOD_CONDITIONS,
  FOOD_CONDITION_LABELS,
  ALLERGENS,
  COMMON_ALLERGENS,
  DIETARY_TAGS,
  COMMON_DIETARY_TAGS,
  LISTING_PHOTO_BUCKET,
  type FoodCondition,
} from "@/lib/constants";
import { TagMultiSelect } from "@/components/forms/TagMultiSelect";
import { PhotoUpload } from "@/components/forms/PhotoUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-p2p-red mt-1.5" role="alert">
      {message}
    </p>
  );
}

function RequiredMark() {
  return (
    <span className="text-p2p-red ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-p2p-border bg-p2p-surface shadow-card p-5 md:p-6">
      <h3 className="text-lg font-semibold text-p2p-text mb-4">{title}</h3>
      <div className="space-y-4 md:space-y-5">{children}</div>
    </section>
  );
}

function SuccessScreen({
  listingId,
  managementToken,
  onReset,
}: {
  listingId: string;
  managementToken: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const manageUrl = `${appUrl}/manage/${managementToken}`;

  function handleCopy() {
    navigator.clipboard.writeText(manageUrl);
    setCopied(true);
    toast("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fade-up flex flex-col items-center text-center py-16 md:py-24">
      <CheckCircle2
        className="size-16 text-p2p-primary mb-6"
        strokeWidth={1.5}
      />
      <h2 className="text-3xl heading-tight text-p2p-text mb-3">
        Your listing is live!
      </h2>
      <p className="text-base text-p2p-text-secondary max-w-md mb-2">
        Students can now see and claim your food.
      </p>
      <p className="text-xs font-mono text-p2p-text-disabled mb-10">
        Listing ID: {listingId}
      </p>

      <div className="w-full max-w-lg rounded-xl border border-p2p-border bg-p2p-surface shadow-card p-5 md:p-6">
        <p className="text-sm font-medium text-p2p-text-secondary mb-3">
          Save this link to manage your listing:
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg border border-p2p-border-subtle bg-p2p-bg px-3 py-2.5 text-sm font-mono text-p2p-text truncate">
            {manageUrl}
          </code>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="shrink-0 gap-1.5 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {copied ? (
              <>
                <CheckCircle2 className="size-4 text-p2p-primary" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <Link
          href="/collect"
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-6 h-11 text-sm font-semibold",
            "bg-p2p-primary text-white hover:bg-p2p-primary-hover",
            "focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2",
            "active:scale-[0.98] transition-transform transition-colors",
          )}
        >
          View on collect feed
        </Link>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onReset}
          className="transition-transform hover:bg-p2p-primary-light focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Post another listing
        </Button>
      </div>
    </div>
  );
}

export function DonorForm() {
  const [submitted, setSubmitted] = useState(false);
  const [listingData, setListingData] = useState<{
    id: string;
    management_token: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      food_category: undefined,
      food_condition: undefined,
      quantity: 1,
      pickup_location: "",
      expires_at: "",
      served_at: "",
      allergens: [],
      dietary_tags: [],
      contact_email: "",
      contact_phone: "",
      zid: "",
      notes: "",
      safety_confirmed: false,
    },
  });

  function scrollToFirstError() {
    requestAnimationFrame(() => {
      const el = document.querySelector('[aria-invalid="true"]');
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function onSubmit(data: Record<string, unknown>) {
    setServerError(null);

    if (photos.length === 0) {
      setPhotoError("Please add at least one photo of the food.");
      document
        .getElementById("photos-field")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPhotoError(null);

    // Mint signed upload URLs server-side, then upload each file DIRECTLY to
    // Supabase Storage from the browser (bytes never go through a Server Action).
    const targetsRes = await createPhotoUploadTargets(
      photos.map((f) => ({ type: f.type, size: f.size })),
    );
    if (targetsRes.error || !targetsRes.targets) {
      setPhotoError(targetsRes.error ?? "Failed to upload photos.");
      return;
    }

    const supabase = createClient();
    const photoUrls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const target = targetsRes.targets[i];
      const { error: uploadErr } = await supabase.storage
        .from(LISTING_PHOTO_BUCKET)
        .uploadToSignedUrl(target.path, target.token, photos[i]);
      if (uploadErr) {
        setPhotoError("Failed to upload photos. Please try again.");
        return;
      }
      photoUrls.push(target.publicUrl);
    }

    const result = await createListing(data as ListingFormValues, photoUrls);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    if (result.data) {
      setListingData(result.data);
      setSubmitted(true);
    }
  }

  function handleReset() {
    reset();
    setSubmitted(false);
    setListingData(null);
    setServerError(null);
    setPhotos([]);
    setPhotoError(null);
  }

  if (submitted && listingData) {
    return (
      <SuccessScreen
        listingId={listingData.id}
        managementToken={listingData.management_token}
        onReset={handleReset}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
      className="space-y-6"
    >
      {/* Section 1 — About the food */}
      <SectionCard title="About the food">
        <div>
          <Label htmlFor="title">
            Title
            <RequiredMark />
          </Label>
          <Input
            id="title"
            placeholder='e.g. "Leftover pizza from CSESoc BBQ"'
            className="mt-1.5 bg-p2p-surface"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>
              Food category
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="food_category"
              render={({ field }) => (
                <Select
                  value={field.value ?? null}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger
                    className="mt-1.5 w-full bg-p2p-surface"
                    aria-invalid={!!errors.food_category}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.food_category?.message} />
          </div>

          <div>
            <Label>
              Food condition
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="food_condition"
              render={({ field }) => (
                <Select
                  value={field.value ?? null}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger
                    className="mt-1.5 w-full bg-p2p-surface"
                    aria-invalid={!!errors.food_condition}
                  >
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CONDITIONS.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {FOOD_CONDITION_LABELS[cond as FoodCondition]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.food_condition?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="quantity">
            Quantity (servings)
            <RequiredMark />
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            className="mt-1.5 bg-p2p-surface"
            aria-invalid={!!errors.quantity}
            {...register("quantity")}
          />
          <FieldError message={errors.quantity?.message} />
        </div>

        <div id="photos-field">
          <Label>
            Photos
            <RequiredMark />
          </Label>
          <PhotoUpload
            files={photos}
            onChange={(next) => {
              setPhotos(next);
              if (next.length > 0) setPhotoError(null);
            }}
            invalid={!!photoError}
          />
          <FieldError message={photoError ?? undefined} />
        </div>
      </SectionCard>

      {/* Section 2 — Pickup details */}
      <SectionCard title="Pickup details">
        <div>
          <Label htmlFor="pickup_location">
            Pickup location
            <RequiredMark />
          </Label>
          <Input
            id="pickup_location"
            placeholder='e.g. "Quadrangle Building, Level 2 foyer"'
            className="mt-1.5 bg-p2p-surface"
            aria-invalid={!!errors.pickup_location}
            {...register("pickup_location")}
          />
          <FieldError message={errors.pickup_location?.message} />
        </div>

        <div>
          <Label htmlFor="expires_at">
            Food available until
            <RequiredMark />
          </Label>
          <Input
            id="expires_at"
            type="datetime-local"
            className="mt-1.5 bg-p2p-surface"
            aria-invalid={!!errors.expires_at}
            {...register("expires_at")}
          />
          <p className="mt-1.5 text-xs text-p2p-text-secondary">
            When does the food stop being safe or available to collect?
          </p>
          <FieldError message={errors.expires_at?.message} />
        </div>

        <div>
          <Label htmlFor="served_at">Time food was served (optional)</Label>
          <Input
            id="served_at"
            type="datetime-local"
            className="mt-1.5 bg-p2p-surface"
            {...register("served_at")}
          />
        </div>
      </SectionCard>

      {/* Section 3 — Dietary information */}
      <SectionCard title="Dietary information">
        <div>
          <Label>Allergens present (optional)</Label>
          <Controller
            control={control}
            name="allergens"
            render={({ field }) => (
              <TagMultiSelect
                options={ALLERGENS}
                commonOptions={COMMON_ALLERGENS}
                value={field.value ?? []}
                onChange={field.onChange}
                accent="amber"
                addPlaceholder="Add another allergen (comma-separated)"
              />
            )}
          />
        </div>

        <div>
          <Label>Dietary tags (optional)</Label>
          <Controller
            control={control}
            name="dietary_tags"
            render={({ field }) => (
              <TagMultiSelect
                options={DIETARY_TAGS}
                commonOptions={COMMON_DIETARY_TAGS}
                value={field.value ?? []}
                onChange={field.onChange}
                accent="primary"
                addPlaceholder="Add another dietary tag (comma-separated)"
              />
            )}
          />
        </div>
      </SectionCard>

      {/* Section 4 — Your contact details */}
      <SectionCard title="Your contact details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_email">
              Email
              <RequiredMark />
            </Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="society@unsw.edu.au"
              className="mt-1.5 bg-p2p-surface"
              aria-invalid={!!errors.contact_email}
              {...register("contact_email")}
            />
            <FieldError message={errors.contact_email?.message} />
          </div>

          <div>
            <Label htmlFor="zid">
              Your zID
              <RequiredMark />
            </Label>
            <Input
              id="zid"
              placeholder="z1234567"
              className="mt-1.5 bg-p2p-surface"
              aria-invalid={!!errors.zid}
              {...register("zid")}
            />
            <FieldError message={errors.zid?.message} />
          </div>

          <div>
            <Label htmlFor="contact_phone">Phone (optional)</Label>
            <Input
              id="contact_phone"
              type="tel"
              placeholder="0400 000 000"
              className="mt-1.5 bg-p2p-surface"
              {...register("contact_phone")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Additional notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any extra info for students picking up the food..."
            className="mt-1.5 bg-p2p-surface"
            aria-invalid={!!errors.notes}
            {...register("notes")}
          />
          <FieldError message={errors.notes?.message} />
        </div>
      </SectionCard>

      {/* Section 5 — Safety confirmation */}
      <Controller
        control={control}
        name="safety_confirmed"
        render={({ field }) => (
          <section
            className={cn(
              "rounded-xl border-2 bg-p2p-surface shadow-card p-5 md:p-6 transition-colors cursor-pointer",
              "hover:shadow-card-hover active:scale-[0.998] transition-transform",
              field.value
                ? "border-p2p-primary bg-p2p-primary-light"
                : "border-p2p-border",
            )}
            onClick={() => field.onChange(!field.value)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                field.onChange(!field.value);
              }
            }}
            role="checkbox"
            aria-checked={field.value}
            tabIndex={0}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                className="mt-0.5 shrink-0"
              />
              <div>
                <span className="text-sm font-semibold text-p2p-text block">
                  Safety confirmation
                </span>
                <span className="text-sm text-p2p-text-secondary mt-1 block body-relaxed">
                  I confirm this food is untouched, safely handled, and suitable
                  for immediate redistribution.
                </span>
              </div>
            </div>
            <FieldError message={errors.safety_confirmed?.message} />
          </section>
        )}
      />

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className={cn(
          "w-full h-12 text-base font-semibold",
          "bg-p2p-primary text-white hover:bg-p2p-primary-hover",
          "focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2",
          "active:scale-[0.98] transition-transform transition-colors",
          "disabled:opacity-60",
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-5 animate-spin mr-2" />
            Posting...
          </>
        ) : (
          "Post Food Listing"
        )}
      </Button>

      {serverError && (
        <div className="rounded-lg bg-p2p-red-light p-4">
          <p className="text-sm text-p2p-red">{serverError}</p>
        </div>
      )}
    </form>
  );
}
