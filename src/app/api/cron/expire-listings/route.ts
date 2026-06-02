// Cron: Expire unclaimed listings past their expiry time (runs every 5 minutes on Vercel).
// Vercel Cron Jobs only fire in production. For local testing, trigger manually:
//   curl http://localhost:3000/api/cron/expire-listings -H "x-cron-secret: <your-secret>"

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = new Date().toISOString();

  const { data: expiredListings, error: fetchError } = await supabase
    .from("listings")
    .select("id")
    .eq("status", "available")
    .lte("expires_at", now);

  if (fetchError) {
    return NextResponse.json(
      {
        error: "Failed to fetch expired listings",
        details: fetchError.message,
      },
      { status: 500 },
    );
  }

  if (!expiredListings || expiredListings.length === 0) {
    return NextResponse.json({ expired: 0 });
  }

  const ids = expiredListings.map((l) => l.id);

  const { error: updateError } = await supabase
    .from("listings")
    .update({ status: "unavailable" })
    .in("id", ids);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to expire listings", details: updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ expired: ids.length });
}
