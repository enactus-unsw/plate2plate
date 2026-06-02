// Server Actions — runs on the server only
// Uses Supabase service role key — never import this in a Client Component
"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  listingSchema,
  type ListingFormValues,
} from "@/lib/validations/listing.schema";
import { sendEmail } from "@/lib/email/send";
import { buildDonorConfirmationEmail } from "@/lib/email/templates/donor-confirmation";
import type { Listing } from "@/types";

export async function createListing(formData: ListingFormValues) {
  const parsed = listingSchema.safeParse(formData);

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const values = parsed.data;

  const expiresAt =
    values.perishability === "<30 mins"
      ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
      : values.expires_at!;

  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("listings")
      .insert({
        title: values.title,
        description: values.description || null,
        food_category: values.food_category,
        food_condition: values.food_condition,
        quantity: values.quantity,
        quantity_remaining: values.quantity,
        photo_url: values.photo_url || null,
        pickup_location: values.pickup_location,
        perishability: values.perishability,
        allergens: values.allergens,
        dietary_tags: values.dietary_tags,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone || null,
        notes: values.notes || null,
        served_at: values.served_at || null,
        expires_at: expiresAt,
      })
      .select("id, management_token")
      .single();

    if (error) {
      console.error("createListing DB error:", error);
      return {
        data: null,
        error: "Failed to create listing. Please try again.",
      };
    }

    const managementUrl = `${process.env.NEXT_PUBLIC_APP_URL}/manage/${data.management_token}`;
    const html = buildDonorConfirmationEmail(
      {
        title: values.title,
        food_category: values.food_category,
        quantity: values.quantity,
        pickup_location: values.pickup_location,
        expires_at: expiresAt,
        perishability: values.perishability,
      },
      managementUrl,
    );
    sendEmail({
      to: values.contact_email,
      subject: "Your listing is live on Plate2Plate 🍽️",
      html,
    });

    return {
      data: {
        id: data.id as string,
        management_token: data.management_token as string,
      },
      error: null,
    };
  } catch (err) {
    console.error("createListing unexpected error:", err);
    return {
      data: null,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateQuantity(
  listingId: string,
  quantityRemaining: number,
) {
  try {
    const supabase = await createServiceClient();

    const updatePayload: { quantity_remaining: number; status?: string } = {
      quantity_remaining: quantityRemaining,
    };

    if (quantityRemaining <= 0) {
      updatePayload.status = "unavailable";
    }

    const { error } = await supabase
      .from("listings")
      .update(updatePayload)
      .eq("id", listingId);

    if (error) {
      console.error("updateQuantity DB error:", error);
      return { error: "Failed to update quantity. Please try again." };
    }

    return { error: null };
  } catch (err) {
    console.error("updateQuantity unexpected error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function closeListing(managementToken: string) {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("listings")
      .update({ status: "unavailable" })
      .eq("management_token", managementToken)
      .select("id")
      .single();

    if (error || !data) {
      console.error("closeListing DB error:", error);
      return { error: "Listing not found or already closed." };
    }

    return { error: null };
  } catch (err) {
    console.error("closeListing unexpected error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function getListingByToken(managementToken: string) {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("management_token", managementToken)
      .single();

    if (error) {
      console.error("getListingByToken DB error:", error);
      return { data: null, error: "Listing not found." };
    }

    return { data: data as Listing, error: null };
  } catch (err) {
    console.error("getListingByToken unexpected error:", err);
    return {
      data: null,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
