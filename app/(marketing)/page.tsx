import { createClient } from "@/lib/supabase/server";
import HomeContent from "./home-content";

export const revalidate = 3600;

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

async function getImpactStats() {
  try {
    const supabase = await createClient();

    const [claimsResult, listingsResult, societiesResult] = await Promise.all([
      supabase
        .from("claims")
        .select("*", { count: "exact", head: true })
        .eq("claim_status", "completed"),
      supabase
        .from("listings")
        .select("quantity_remaining")
        .eq("status", "unavailable"),
      supabase.from("listings").select("contact_email"),
    ]);

    const mealsRescued = claimsResult.count ?? 0;

    const kgDiverted = Math.round(
      (listingsResult.data ?? []).reduce(
        (sum, l) => sum + (l.quantity_remaining ?? 0),
        0,
      ) * 0.3,
    );

    const uniqueEmails = new Set(
      (societiesResult.data ?? []).map((l) => l.contact_email),
    );
    const societiesParticipating = uniqueEmails.size;

    const co2Avoided = Math.round(kgDiverted * 2.5);

    return { mealsRescued, kgDiverted, societiesParticipating, co2Avoided };
  } catch {
    return {
      mealsRescued: 0,
      kgDiverted: 0,
      societiesParticipating: 0,
      co2Avoided: 0,
    };
  }
}

export default async function HomePage() {
  const stats = await getImpactStats();

  const impactStats = [
    { value: formatStat(stats.mealsRescued), label: "meals rescued" },
    { value: formatStat(stats.kgDiverted), label: "kg diverted from waste" },
    {
      value: formatStat(stats.societiesParticipating),
      label: "societies",
    },
    { value: formatStat(stats.co2Avoided), label: "CO₂-e avoided" },
  ];

  return <HomeContent impactStats={impactStats} />;
}
