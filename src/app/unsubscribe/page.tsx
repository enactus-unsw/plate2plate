import { PageWrapper } from "@/components/layout/PageWrapper";
import { UnsubscribeForm } from "@/components/landing/UnsubscribeForm";

export const metadata = {
  title: "Unsubscribe — FoodCompass",
  description: "Stop receiving food alert emails from FoodCompass.",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <PageWrapper className="py-16 md:py-24">
      <div className="mx-auto max-w-md rounded-xl border border-[--color-border] bg-p2p-surface p-6 shadow-card md:p-8">
        <UnsubscribeForm initialEmail={email ?? ""} />
      </div>
    </PageWrapper>
  );
}
