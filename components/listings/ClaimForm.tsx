"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  claimFormSchema,
  type ClaimFormValues,
} from "@/lib/validations/claim.schema";
import { claimListing } from "@/lib/actions/claims";
import { useClaimedListings } from "@/hooks/use-claimed-listings";
import { cn } from "@/lib/utils";
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
import type { Listing } from "@/types";

interface ClaimFormProps {
  listing: Listing;
}

interface EtaOption {
  value: string;
  label: string;
}

function generateEtaOptions(listing: Listing): EtaOption[] {
  const now = Date.now();
  const expiresAt = new Date(listing.expires_at).getTime();

  const intervals =
    listing.perishability === "<30 mins"
      ? [5, 10, 15, 20, 25]
      : [15, 30, 45, 60, 90, 120];

  return intervals
    .filter((mins) => now + mins * 60000 <= expiresAt)
    .map((mins) => {
      const arrivalTime = new Date(now + mins * 60000);
      const timeStr = arrivalTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      const label =
        mins >= 60
          ? `${mins / 60} hr${mins > 60 ? "s" : ""} (arrives ~${timeStr})`
          : `${mins} minutes (arrives ~${timeStr})`;

      return {
        value: new Date(now + mins * 60000).toISOString(),
        label,
      };
    });
}

function RequiredMark() {
  return (
    <span className="text-p2p-red ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

export function ClaimForm({ listing }: ClaimFormProps) {
  const { addClaim } = useClaimedListings();
  const [submitted, setSubmitted] = useState(false);
  const [chosenEta, setChosenEta] = useState<string>("");
  const [termsOpen, setTermsOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const etaOptions = useMemo(
    () => (mounted ? generateEtaOptions(listing) : []),
    [listing, mounted],
  );
  const fullyReserved = listing.quantity_remaining <= 0;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      student_name: "",
      student_email: "",
      zid: "",
      student_eta: "",
      accepted_terms: false,
    },
  });

  const acceptedTerms = watch("accepted_terms");

  function scrollToFirstError() {
    requestAnimationFrame(() => {
      const el = document.querySelector('[aria-invalid="true"]');
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  const onSubmit = async (data: ClaimFormValues) => {
    const result = await claimListing(listing.id, data);

    if (result.error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    addClaim(listing.id);
    setChosenEta(data.student_eta);
    setSubmitted(true);

    const etaLabel = new Date(data.student_eta).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    toast.success(
      `Food claimed! Head to ${listing.pickup_location} by ${etaLabel}.`,
    );
  };

  if (submitted) {
    const etaTime = chosenEta
      ? new Date(chosenEta).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

    return (
      <div className="rounded-xl border border-p2p-border bg-p2p-surface p-6 shadow-card">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-p2p-primary-light p-3">
            <CheckCircle2 size={32} className="text-p2p-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-p2p-text">
            You&apos;ve claimed this!
          </h3>
          {etaTime && (
            <p className="mb-4 text-sm text-p2p-text-secondary">
              Head to{" "}
              <span className="font-medium text-p2p-text">
                {listing.pickup_location}
              </span>{" "}
              by <span className="font-medium text-p2p-text">{etaTime}</span>.
            </p>
          )}
          {!etaTime && (
            <p className="mb-4 text-sm text-p2p-text-secondary">
              Head to{" "}
              <span className="font-medium text-p2p-text">
                {listing.pickup_location}
              </span>{" "}
              as soon as possible.
            </p>
          )}
          <div className="w-full rounded-lg bg-p2p-surface-warm p-3">
            <p className="flex items-center justify-center gap-2 text-sm text-p2p-text-secondary">
              <Mail size={14} />
              Need to reach them?{" "}
              <span className="font-medium text-p2p-text">
                {listing.contact_email}
              </span>
            </p>
          </div>
          <Link
            href="/collect"
            className="mt-5 inline-flex items-center rounded-lg bg-p2p-primary px-4 py-2.5 text-sm font-medium text-white transition-shadow transition-transform hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  if (fullyReserved) {
    return (
      <div className="rounded-xl border border-p2p-border bg-p2p-surface p-6 shadow-card">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-p2p-amber-light p-3">
            <CheckCircle2 size={32} className="text-p2p-amber" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-p2p-text">
            Fully Reserved
          </h3>
          <p className="mb-4 text-sm text-p2p-text-secondary">
            All servings have been claimed. Check back — servings may open up if
            someone doesn&apos;t collect.
          </p>
          <Link
            href="/collect"
            className="mt-1 inline-flex items-center rounded-lg bg-p2p-primary px-4 py-2.5 text-sm font-medium text-white transition-shadow transition-transform hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-p2p-border bg-p2p-surface p-6 shadow-card">
      <h3 className="mb-1 text-xl font-semibold text-p2p-text">
        Claim this food
      </h3>
      <p className="mb-5 text-sm text-p2p-text-secondary">
        Enter your details and we&apos;ll hold this for you.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="student_name"
            className="mb-1.5 block text-sm font-medium text-p2p-text"
          >
            Full name
            <RequiredMark />
          </label>
          <input
            id="student_name"
            type="text"
            placeholder="Your name"
            className="w-full rounded-lg border border-p2p-border bg-white px-3.5 py-2.5 text-base text-p2p-text placeholder:text-p2p-text-disabled transition-shadow focus:outline-none focus:ring-2 focus:ring-p2p-primary focus:ring-offset-1 min-h-[44px]"
            aria-invalid={!!errors.student_name}
            {...register("student_name")}
          />
          {errors.student_name && (
            <p className="mt-1 text-xs text-p2p-red" role="alert">
              {errors.student_name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="student_email"
            className="mb-1.5 block text-sm font-medium text-p2p-text"
          >
            Email address
            <RequiredMark />
          </label>
          <input
            id="student_email"
            type="email"
            placeholder="you@student.unsw.edu.au"
            className="w-full rounded-lg border border-p2p-border bg-white px-3.5 py-2.5 text-base text-p2p-text placeholder:text-p2p-text-disabled transition-shadow focus:outline-none focus:ring-2 focus:ring-p2p-primary focus:ring-offset-1 min-h-[44px]"
            aria-invalid={!!errors.student_email}
            {...register("student_email")}
          />
          {errors.student_email && (
            <p className="mt-1 text-xs text-p2p-red" role="alert">
              {errors.student_email.message}
            </p>
          )}
        </div>

        {/* zID */}
        <div>
          <label
            htmlFor="student_zid"
            className="mb-1.5 block text-sm font-medium text-p2p-text"
          >
            zID
            <RequiredMark />
          </label>
          <input
            id="student_zid"
            type="text"
            placeholder="z1234567"
            className="w-full rounded-lg border border-p2p-border bg-white px-3.5 py-2.5 text-base text-p2p-text placeholder:text-p2p-text-disabled transition-shadow focus:outline-none focus:ring-2 focus:ring-p2p-primary focus:ring-offset-1 min-h-[44px]"
            aria-invalid={!!errors.zid}
            {...register("zid")}
          />
          {errors.zid && (
            <p className="mt-1 text-xs text-p2p-red" role="alert">
              {errors.zid.message}
            </p>
          )}
        </div>

        {/* ETA */}
        <div>
          <label
            htmlFor="student_eta"
            className="mb-1.5 block text-sm font-medium text-p2p-text"
          >
            Estimated arrival time
            <RequiredMark />
          </label>
          <select
            id="student_eta"
            className="w-full rounded-lg border border-p2p-border bg-white px-3.5 py-2.5 text-base text-p2p-text transition-shadow focus:outline-none focus:ring-2 focus:ring-p2p-primary focus:ring-offset-1 min-h-[44px]"
            aria-invalid={!!errors.student_eta}
            {...register("student_eta")}
          >
            <option value="">Select your ETA</option>
            {etaOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.student_eta && (
            <p className="mt-1 text-xs text-p2p-red" role="alert">
              {errors.student_eta.message}
            </p>
          )}
        </div>

        {/* Recipient Acknowledgement */}
        <Controller
          name="accepted_terms"
          control={control}
          render={({ field }) => (
            <AlertDialog open={termsOpen} onOpenChange={setTermsOpen}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-p2p-text">
                  Recipient Acknowledgement
                  <RequiredMark />
                </label>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-base transition-shadow focus:outline-none focus:ring-2 focus:ring-p2p-primary focus:ring-offset-1 min-h-[44px]",
                    field.value
                      ? "border-p2p-primary bg-p2p-primary-light text-p2p-text"
                      : "border-p2p-border bg-white text-p2p-text-secondary hover:border-p2p-text-disabled",
                  )}
                  onClick={() => setTermsOpen(true)}
                >
                  <span>
                    {field.value ? "Terms accepted" : "Read and accept terms"}
                  </span>
                  <CheckCircle2
                    size={18}
                    className={cn(
                      "shrink-0",
                      field.value
                        ? "text-p2p-primary"
                        : "text-p2p-text-disabled",
                    )}
                  />
                </button>
                {errors.accepted_terms && (
                  <p className="mt-1 text-xs text-p2p-red" role="alert">
                    {errors.accepted_terms.message}
                  </p>
                )}
              </div>

              <AlertDialogContent
                className="!max-h-[90vh] !max-w-2xl max-sm:!w-[calc(100%-2rem)] overflow-y-auto"
                initialFocus={false}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Recipient Acknowledgement & Food Safety Requirements
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Please read and accept these terms before claiming food.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 max-sm:px-1 sm:px-2 text-base text-p2p-text-secondary">
                  <section className="space-y-3 border-b border-p2p-border-subtle max-sm:pb-4 sm:pb-6">
                    <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                      Recipient Acknowledgement
                    </h4>
                    <ul className="list-disc space-y-2 pl-5 marker:text-p2p-primary-mid/60 text-sm max-sm:text-xs">
                      <li>Food may contain allergens or contaminants.</li>
                      <li>
                        The platform cannot guarantee the accuracy,
                        completeness, or reliability of provider information.
                      </li>
                      <li>
                        The platform does not independently verify food safety,
                        storage conditions, temperature history, allergen
                        information, ingredient lists, or expiry details.
                      </li>
                      <li>
                        You are responsible for assessing whether food suits
                        your dietary, medical, religious, ethical, or
                        allergy-related requirements.
                      </li>
                      <li>
                        You accept all risks associated with consuming food
                        obtained through the platform.
                      </li>
                      <li>
                        You should not consume food if you have any concerns
                        about its safety, freshness, preparation, storage,
                        transport, temperature control, allergen content, or
                        condition.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-3 border-b border-p2p-border-subtle max-sm:pb-4 sm:pb-6">
                    <h4 className="font-heading text-base font-semibold tracking-tight text-p2p-text">
                      Food Safety Requirements
                    </h4>
                    <p className="text-sm max-sm:text-xs">
                      Users must comply with all applicable food safety laws and
                      standards, including the Australia New Zealand Food
                      Standards Code, Food Safety Standard 3.2.2, any applicable
                      provisions of Food Safety Standard 3.2.2A, the Food Act
                      2003 (NSW), NSW Food Authority requirements and guidance,
                      and any other applicable food safety legislation.
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
                    I Agree
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !acceptedTerms}
          className="w-full rounded-lg bg-p2p-primary px-4 py-3 text-base font-medium text-white transition-shadow transition-transform hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin mr-2 inline" />
              Claiming...
            </>
          ) : (
            "Claim this food"
          )}
        </button>
      </form>
    </div>
  );
}
