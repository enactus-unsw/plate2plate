"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createListing, uploadListingPhotos } from "@/lib/actions/listings";
import { compressImage } from "@/lib/utils/compress-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  type FoodCondition,
} from "@/lib/constants";
import { TagMultiSelect } from "@/components/forms/TagMultiSelect";
import { PhotoUpload } from "@/components/forms/PhotoUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

      <div className="mt-8 flex w-full max-w-lg flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/collect"
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-6 h-11 text-sm font-semibold",
            "bg-p2p-primary text-white hover:bg-p2p-primary-hover",
            "focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2",
            "active:scale-[0.98] transition-transform",
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
  const [termsOpen, setTermsOpen] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  useEffect(() => {
    if (termsOpen) {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          '[data-slot="alert-dialog-content"]',
        );
        el?.scrollTo(0, 0);
      });
    }
  }, [termsOpen]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, submitCount },
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
      contact_name: "",
      zid: "",
      notes: "",
      safety_confirmed: false,
    },
  });

  const safetyConfirmed = useWatch({
    control,
    name: "safety_confirmed",
  });

  function scrollToFirstError() {
    setTriedSubmit(true);
    requestAnimationFrame(() => {
      const el = document.querySelector('[aria-invalid="true"]');
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function onSubmit(data: Record<string, unknown>) {
    setServerError(null);

    setPhotoError(null);

    if (photos.length === 0) {
      setPhotoError("Please upload at least 1 photo.");
      setTriedSubmit(true);
      return;
    }

    let photoUrls: string[] = [];

    if (photos.length > 0) {
      const compressed = await Promise.all(photos.map(compressImage));
      const formData = new FormData();
      compressed.forEach((file) => formData.append("files", file));

      const upload = await uploadListingPhotos(formData);
      if (upload.error || !upload.urls) {
        setPhotoError(upload.error ?? "Failed to upload photos.");
        return;
      }
      photoUrls = upload.urls;
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
                    <SelectValue placeholder="Select condition">
                      {field.value
                        ? FOOD_CONDITION_LABELS[field.value as FoodCondition]
                        : "Select condition"}
                    </SelectValue>
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
            Photo(s)
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
        <div>
          <Label htmlFor="contact_name">
            Name
            <RequiredMark />
          </Label>
          <Input
            id="contact_name"
            placeholder="e.g. CSESoc"
            className="mt-1.5 bg-p2p-surface"
            aria-invalid={!!errors.contact_name}
            {...register("contact_name")}
          />
          <FieldError message={errors.contact_name?.message} />
        </div>

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
          <AlertDialog open={termsOpen} onOpenChange={setTermsOpen}>
            <section
              className={cn(
                "rounded-xl border-2 bg-p2p-surface shadow-card p-5 md:p-6 transition-colors",
                "hover:shadow-card-hover active:scale-[0.998] transition-transform",
                field.value
                  ? "border-p2p-primary bg-p2p-primary-light"
                  : "border-p2p-border cursor-pointer",
              )}
              onClick={() => setTermsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setTermsOpen(true);
                }
              }}
              role="button"
              aria-label="Read and accept the food safety terms"
              aria-pressed={field.value}
              tabIndex={0}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border",
                    field.value
                      ? "border-p2p-primary bg-p2p-primary text-white"
                      : "border-p2p-border bg-p2p-surface-warm text-p2p-text-secondary",
                  )}
                >
                  {field.value ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <span className="text-sm font-semibold">1</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-p2p-text block">
                    Safety Confirmation
                  </span>
                  <span className="text-sm text-p2p-text-secondary mt-1 block body-relaxed">
                    {field.value
                      ? "Terms accepted. You can post this food listing."
                      : "Read the food safety terms and accept them before posting."}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-p2p-text-secondary">
                  {field.value
                    ? "You can review the terms again if needed."
                    : "Tap to open the terms and conditions notice."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 transition-transform hover:bg-p2p-primary-light focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  {field.value ? "Review terms" : "Read terms"}
                </Button>
              </div>

              <FieldError message={errors.safety_confirmed?.message} />
            </section>

            <AlertDialogContent
              className="!max-h-[90vh] !max-w-2xl overflow-y-auto"
              initialFocus={false}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
                <AlertDialogDescription>
                  FoodCampus - user declaration and risk acknowledgement.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="text-base text-p2p-text-secondary body-relaxed">
                <section className="space-y-2 border-b border-p2p-border-subtle pb-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Last updated: 14th June 2026
                  </h4>
                  <p>
                    This platform is operated by Enactus UNSW (the Society). It
                    exists solely to connect providers of surplus food with
                    recipients who wish to collect it. The Society does not
                    prepare, cook, store, package, transport, inspect, test,
                    certify, endorse, verify, distribute, or supply any food
                    listed on the platform.
                  </p>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Acceptance of Terms
                  </h4>
                  <p>
                    By accessing, posting on, collecting food through, or
                    otherwise using this platform, you acknowledge that you have
                    read, understood, and agree to be legally bound by these
                    Terms and Conditions. If you do not agree, you must not use
                    the platform.
                  </p>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Provider Declaration
                  </h4>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-p2p-primary-mid/60">
                    <li>You are entitled to provide the food.</li>
                    <li>
                      The information you provide is accurate and complete.
                    </li>
                    <li>Known allergens have been disclosed.</li>
                    <li>The preparation date and time are accurate.</li>
                    <li>
                      The food has been handled, stored, displayed, and
                      transported in accordance with applicable Australian food
                      safety laws, standards, regulations, and guidelines.
                    </li>
                    <li>
                      Potentially hazardous food has been maintained under
                      legally required temperature controls.
                    </li>
                    <li>
                      The food is, to the best of your knowledge, safe and
                      suitable for human consumption.
                    </li>
                    <li>
                      The food has not been contaminated, adulterated, tampered
                      with, or exposed to unsafe conditions.
                    </li>
                    <li>
                      You remain solely responsible for the safety, quality,
                      suitability, handling, storage, transportation, and
                      condition of the food you provide.
                    </li>
                  </ul>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Recipient Acknowledgement
                  </h4>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-p2p-primary-mid/60">
                    <li>Food may contain allergens or contaminants.</li>
                    <li>
                      The platform cannot guarantee the accuracy, completeness,
                      or reliability of provider information.
                    </li>
                    <li>
                      The platform does not independently verify food safety,
                      storage conditions, temperature history, allergen
                      information, ingredient lists, or expiry details.
                    </li>
                    <li>
                      You are responsible for assessing whether food suits your
                      dietary, medical, religious, ethical, or allergy-related
                      requirements.
                    </li>
                    <li>
                      You accept all risks associated with consuming food
                      obtained through the platform.
                    </li>
                    <li>
                      You should not consume food if you have any concerns about
                      its safety, freshness, preparation, storage, transport,
                      temperature control, allergen content, or condition.
                    </li>
                  </ul>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Food Safety Requirements
                  </h4>
                  <p>
                    Users must comply with all applicable food safety laws and
                    standards, including the Australia New Zealand Food
                    Standards Code, Food Safety Standard 3.2.2, any applicable
                    provisions of Food Safety Standard 3.2.2A, the Food Act 2003
                    (NSW), NSW Food Authority requirements and guidance, and any
                    other applicable food safety legislation.
                  </p>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    No Warranties, Assumption of risk, and Indemnity
                  </h4>
                  <p>
                    To the maximum extent permitted by law, the Society makes no
                    representation, warranty, or guarantee regarding the safety,
                    suitability, quality, or condition of any food, or the
                    accuracy of any listing. All food is accepted by recipients
                    on an as-is basis.
                  </p>
                  <p>
                    Users voluntarily assume all risks associated with
                    collecting, transporting, storing, reheating, and consuming
                    food, including allergic reactions, foodborne illness,
                    contamination, spoilage, and mislabelled or undisclosed
                    ingredients.
                  </p>
                  <p>
                    To the maximum extent permitted by law, users release and
                    indemnify the Society and its related people and partners
                    from claims, liabilities, losses, injuries, or expenses
                    arising from food listed on the platform, collection or
                    consumption of food, foodborne illness, allergic reactions,
                    contamination, or incorrect information supplied by any
                    user.
                  </p>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Platform Role Only
                  </h4>
                  <p>
                    The Society does not own, possess, store, control, inspect,
                    test, approve, or certify food safety compliance. Its role
                    is limited to providing a platform through which users may
                    exchange information regarding surplus food.
                  </p>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Removal of Content and Reporting Concerns
                  </h4>
                  <p>
                    The Society may remove a listing, suspend access, or
                    restrict use of the platform at its sole discretion where
                    food safety concerns arise or where these Terms may have
                    been breached. Users must immediately report suspected
                    foodborne illness, contamination, misrepresentation,
                    undisclosed allergens, or unsafe food handling practices
                    through the platform&apos;s reporting mechanisms.
                  </p>
                </section>

                <section className="space-y-2 border-b border-p2p-border-subtle py-6">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    Limitation of Liability and Governing Law
                  </h4>
                  <p>
                    To the fullest extent permitted by law, the Society excludes
                    all liability for any direct, indirect, consequential,
                    incidental, special, punitive, or economic loss arising out
                    of or related to the use of the platform or consumption of
                    food obtained through it. Where liability cannot lawfully be
                    excluded, it is limited to the minimum extent permitted by
                    law.
                  </p>
                  <p>
                    These Terms are governed by the laws of New South Wales and
                    Australia, and users submit to the exclusive jurisdiction of
                    the courts of New South Wales.
                  </p>
                </section>

                <section className="mt-6 rounded-lg border border-p2p-border bg-p2p-surface-warm p-4">
                  <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                    User Confirmation
                  </h4>
                  <p className="mt-2">
                    By selecting I Agree, you confirm that you have read and
                    understood these Terms and Conditions, you understand that
                    the Society is not the supplier of food and does not verify
                    food safety, and you agree to comply with all applicable
                    food safety laws and standards.
                  </p>
                </section>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Not yet</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    field.onChange(true);
                    setTermsOpen(false);
                  }}
                >
                  I have read and agree
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
          "active:scale-[0.98] transition-transform",
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

      {triedSubmit &&
        (errors.title ||
          errors.food_category ||
          errors.food_condition ||
          errors.quantity ||
          errors.pickup_location ||
          errors.expires_at ||
          errors.contact_name ||
          errors.contact_email ||
          errors.zid ||
          errors.safety_confirmed ||
          photoError) && (
          <p className="text-center text-sm text-p2p-red">
            Please fill in all required fields above.
          </p>
        )}

      {serverError && (
        <div className="rounded-lg bg-p2p-red-light p-4">
          <p className="text-sm text-p2p-red">{serverError}</p>
        </div>
      )}
    </form>
  );
}
