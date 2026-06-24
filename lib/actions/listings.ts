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
import { notifySubscribers } from "@/lib/email/send-subscriber-notification";
import type { Listing } from "@/types";

const LISTING_PHOTO_BUCKET = "listing-photos";
const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

// Uploads the donor's food photos to Supabase Storage and returns their public
// URLs. Runs with the service-role key (bypasses RLS) — consistent with the
// app's no-auth model. Called from the donor form before createListing.
export async function uploadListingPhotos(formData: FormData) {
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return { urls: null, error: "Please add at least one photo of the food." };
  }
  if (files.length > MAX_PHOTOS) {
    return {
      urls: null,
      error: `You can upload at most ${MAX_PHOTOS} photos.`,
    };
  }

  for (const file of files) {
    if (!ALLOWED_PHOTO_TYPES[file.type]) {
      return {
        urls: null,
        error: "Photos must be JPG, PNG, WebP, or HEIC images.",
      };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { urls: null, error: "Each photo must be 5 MB or smaller." };
    }
  }

  try {
    const supabase = await createServiceClient();
    const urls: string[] = [];

    for (const file of files) {
      const ext = ALLOWED_PHOTO_TYPES[file.type];
      const path = `${crypto.randomUUID()}.${ext}`;
      const bytes = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(LISTING_PHOTO_BUCKET)
        .upload(path, bytes, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error("uploadListingPhotos error:", uploadError);
        return {
          urls: null,
          error: "Failed to upload photos. Please try again.",
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(LISTING_PHOTO_BUCKET).getPublicUrl(path);
      urls.push(publicUrl);
    }

    return { urls, error: null };
  } catch (err) {
    console.error("uploadListingPhotos unexpected error:", err);
    return {
      urls: null,
      error: "An unexpected error occurred while uploading.",
    };
  }
}

export async function createListing(
  formData: ListingFormValues,
  photoUrls: string[],
) {
  const parsed = listingSchema.safeParse(formData);

  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const values = parsed.data;

  const expiresAt = new Date(values.expires_at).toISOString();
  // Derive the perishability bucket from how soon the food expires. This keeps
  // the claim-page ETA granularity working without asking the donor directly.
  const perishability =
    Date.parse(expiresAt) - Date.now() <= 30 * 60 * 1000
      ? "<30 mins"
      : ">=30 mins";

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
        photo_url: photoUrls?.[0] || null,
        photo_urls: photoUrls || [],
        pickup_location: values.pickup_location,
        perishability,
        allergens: values.allergens,
        dietary_tags: values.dietary_tags,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone || null,
        contact_name: values.contact_name,
        zid: values.zid,
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
        perishability,
      },
      managementUrl,
    );
    sendEmail({
      to: values.contact_email,
      subject: "Your listing is live on FoodCompass 🍽️",
      html,
    });

    notifySubscribers({
      id: data.id as string,
      title: values.title,
      description: values.description || null,
      food_category: values.food_category,
      quantity: values.quantity,
      pickup_location: values.pickup_location,
      expires_at: expiresAt,
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

export async function markCollected(managementToken: string) {
  try {
    const supabase = await createServiceClient();

    const { data: listing, error: lookupError } = await supabase
      .from("listings")
      .select("id, status")
      .eq("management_token", managementToken)
      .single();

    if (lookupError || !listing) {
      console.error("markCollected lookup error:", lookupError);
      return { error: "Listing not found." };
    }

    if (listing.status === "collected") {
      return { error: "This listing is already marked as collected." };
    }

    if (listing.status !== "available" && listing.status !== "held") {
      return { error: "This listing is closed and can no longer be updated." };
    }

    // Mark any active claim on this listing as completed so the feedback loop runs.
    const { error: claimError } = await supabase
      .from("claims")
      .update({
        claim_status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("listing_id", listing.id)
      .eq("claim_status", "active");

    if (claimError) {
      console.error("markCollected claim update error:", claimError);
      return { error: "Failed to update the claim. Please try again." };
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({ status: "collected", served_at: new Date().toISOString() })
      .eq("management_token", managementToken);

    if (updateError) {
      console.error("markCollected listing update error:", updateError);
      return { error: "Failed to mark as collected. Please try again." };
    }

    return { error: null };
  } catch (err) {
    console.error("markCollected unexpected error:", err);
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
