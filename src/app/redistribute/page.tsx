import { PageWrapper } from "@/components/layout/PageWrapper";
import { DonorForm } from "@/components/forms/DonorForm";

export default function RedistributePage() {
  return (
    <PageWrapper className="py-10 sm:py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl heading-tight text-p2p-text">
            Post Surplus Food
          </h1>
          <p className="text-base text-p2p-text-secondary mt-3 body-relaxed">
            Got food left over from your event? Post it here and students can
            claim it in minutes.
          </p>
        </div>
        <DonorForm />
      </div>
    </PageWrapper>
  );
}
