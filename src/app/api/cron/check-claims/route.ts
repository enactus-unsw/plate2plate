// Cron: Check active claims for missed ETAs (runs every 2 minutes on Vercel).
// Vercel Cron Jobs only fire in production. For local testing, trigger manually:
//   curl http://localhost:3000/api/cron/check-claims -H "x-cron-secret: <your-secret>"

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const GRACE_PERIOD_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = new Date();

  const { data: activeClaims, error: fetchError } = await supabase
    .from("claims")
    .select(
      "id, listing_id, student_eta, listings!inner(id, expires_at, status)",
    )
    .eq("claim_status", "active");

  if (fetchError) {
    return NextResponse.json(
      { error: "Failed to fetch active claims", details: fetchError.message },
      { status: 500 },
    );
  }

  if (!activeClaims || activeClaims.length === 0) {
    return NextResponse.json({ processed: 0, revoked: 0 });
  }

  let revoked = 0;

  for (const claim of activeClaims) {
    const listing = claim.listings as unknown as {
      id: string;
      expires_at: string;
      status: string;
    };

    const expiresAt = new Date(listing.expires_at);
    const studentEta = new Date(claim.student_eta);
    const graceDeadline = new Date(studentEta.getTime() + GRACE_PERIOD_MS);

    if (now >= expiresAt) {
      // Listing has expired — revoke claim and mark listing unavailable
      await supabase
        .from("claims")
        .update({ claim_status: "revoked" })
        .eq("id", claim.id);

      await supabase
        .from("listings")
        .update({ status: "unavailable" })
        .eq("id", claim.listing_id);

      revoked++;
    } else if (now > graceDeadline) {
      // Student missed ETA + grace period but listing is still valid — release it
      await supabase
        .from("claims")
        .update({ claim_status: "revoked" })
        .eq("id", claim.id);

      await supabase
        .from("listings")
        .update({ status: "available" })
        .eq("id", claim.listing_id);

      revoked++;
    }
  }

  return NextResponse.json({ processed: activeClaims.length, revoked });
}
