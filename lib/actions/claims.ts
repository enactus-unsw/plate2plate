// Server Actions — runs on the server only
// Uses Supabase service role key — never import this in a Client Component
"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  claimFormSchema,
  type ClaimFormValues,
} from "@/lib/validations/claim.schema";
import { sendEmail } from "@/lib/email/send";
import { buildStudentConfirmationEmail } from "@/lib/email/templates/student-confirmation";
import { buildDonorClaimNotificationEmail } from "@/lib/email/templates/donor-claim-notification";

export async function claimListing(
  listingId: string,
  claimData: ClaimFormValues,
) {
  const parsed = claimFormSchema.safeParse(claimData);

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const values = parsed.data;

  try {
    const supabase = await createServiceClient();

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, status, quantity_remaining")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      console.error("claimListing lookup error:", listingError);
      return { data: null, error: "This listing is no longer available." };
    }

    if (listing.status !== "available" && listing.status !== "held") {
      return { data: null, error: "This listing is no longer available." };
    }

    if (listing.quantity_remaining <= 0) {
      return { data: null, error: "All servings have been reserved." };
    }

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .insert({
        listing_id: listingId,
        student_name: values.student_name,
        student_email: values.student_email,
        zid: values.zid,
        student_eta: values.student_eta,
      })
      .select("id")
      .single();

    if (claimError) {
      console.error("claimListing insert error:", claimError);
      return {
        data: null,
        error: "Failed to claim listing. Please try again.",
      };
    }

    const newQuantity = listing.quantity_remaining - 1;

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        status: "held",
        quantity_remaining: newQuantity,
      })
      .eq("id", listingId);

    if (updateError) {
      console.error("claimListing update error:", updateError);
      return {
        data: null,
        error:
          "Claim created but failed to update listing. Please contact support.",
      };
    }

    const { data: fullListing } = await supabase
      .from("listings")
      .select(
        "id, title, food_category, pickup_location, expires_at, contact_email, contact_phone, management_token",
      )
      .eq("id", listingId)
      .single();

    if (fullListing) {
      const studentHtml = buildStudentConfirmationEmail(
        {
          id: fullListing.id as string,
          title: fullListing.title,
          food_category: fullListing.food_category,
          pickup_location: fullListing.pickup_location,
          expires_at: fullListing.expires_at,
          contact_email: fullListing.contact_email,
          contact_phone: fullListing.contact_phone,
        },
        {
          student_name: values.student_name,
          student_eta: values.student_eta,
        },
      );
      sendEmail({
        to: values.student_email,
        subject: "You've claimed food on FoodCompass 🍽️",
        html: studentHtml,
      });

      const manageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/manage/${fullListing.management_token}`;
      const donorHtml = buildDonorClaimNotificationEmail(
        {
          title: fullListing.title,
          pickup_location: fullListing.pickup_location,
        },
        {
          student_name: values.student_name,
          student_email: values.student_email,
          student_eta: values.student_eta,
        },
        manageUrl,
      );
      sendEmail({
        to: fullListing.contact_email,
        subject: `Someone claimed your food — "${fullListing.title}" 🙌`,
        html: donorHtml,
      });
    }

    return { data: { claim_id: claim.id as string }, error: null };
  } catch (err) {
    console.error("claimListing unexpected error:", err);
    return {
      data: null,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function revokeClaim(claimId: string) {
  try {
    const supabase = await createServiceClient();

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .update({ claim_status: "revoked" })
      .eq("id", claimId)
      .select("listing_id")
      .single();

    if (claimError || !claim) {
      console.error("revokeClaim DB error:", claimError);
      return { error: "Claim not found or already revoked." };
    }

    const { error: listingError } = await supabase
      .from("listings")
      .update({ status: "available" })
      .eq("id", claim.listing_id);

    if (listingError) {
      console.error("revokeClaim listing update error:", listingError);
      return { error: "Claim revoked but failed to update listing status." };
    }

    return { error: null };
  } catch (err) {
    console.error("revokeClaim unexpected error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function completeClaim(claimId: string) {
  try {
    const supabase = await createServiceClient();

    const { error } = await supabase
      .from("claims")
      .update({
        claim_status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    if (error) {
      console.error("completeClaim DB error:", error);
      return { error: "Failed to complete claim. Please try again." };
    }

    return { error: null };
  } catch (err) {
    console.error("completeClaim unexpected error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
