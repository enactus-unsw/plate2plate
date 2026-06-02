import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ManageListingCard } from "@/components/listings/ManageListingCard";
import { getListingByToken } from "@/lib/actions/listings";
import { createServiceClient } from "@/lib/supabase/server";
import type { Claim } from "@/types";

export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const result = await getListingByToken(token);

  if (result.error || !result.data) {
    return (
      <PageWrapper className="py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-p2p-surface-warm p-4">
            <ShieldX size={32} className="text-p2p-text-disabled" />
          </div>
          <h1 className="mb-2 font-sans text-2xl font-semibold text-p2p-text">
            Listing not found
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-p2p-text-secondary">
            This management link is invalid or the listing has been removed.
          </p>
          <Link
            href="/collect"
            className="inline-flex items-center gap-1.5 rounded-lg bg-p2p-primary px-4 py-2.5 text-sm font-medium text-white transition-transform hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Go to collect feed
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const listing = result.data;

  let activeClaim: Claim | null = null;
  const supabase = await createServiceClient();
  const { data: claimData } = await supabase
    .from("claims")
    .select("*")
    .eq("listing_id", listing.id)
    .eq("claim_status", "active")
    .limit(1)
    .maybeSingle();

  if (claimData) {
    activeClaim = claimData as Claim;
  }

  return (
    <PageWrapper className="py-16 md:py-24">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-p2p-text-secondary transition-colors hover:text-p2p-primary focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="mb-2 font-sans text-2xl font-semibold text-p2p-text">
        Manage your listing
      </h1>
      <p className="mb-8 text-sm text-p2p-text-secondary">
        This is your private management page. Only people with this link can
        access it.
      </p>

      <div className="max-w-2xl">
        <ManageListingCard listing={listing} activeClaim={activeClaim} />
      </div>
    </PageWrapper>
  );
}
