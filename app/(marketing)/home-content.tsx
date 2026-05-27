"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { HoverButton } from "@/components/ui/hover-button";
import { AboutBento } from "@/components/listings/AboutBento";
import Safari01 from "@/components/ui/safari-01";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";

/* ─── Copy constants ─── */

const HERO_HEADLINE = "Good food. Right place. Right now.";
const HERO_SUB =
  "Free food from UNSW events, rescued before it goes to waste. Claim yours in seconds.";

const DONOR_STEPS = [
  {
    num: "1",
    kicker: "POST",
    title: "List your surplus food",
    desc: "Describe what’s left, where it is, and how long it’ll stay fresh — under a minute.",
  },
  {
    num: "2",
    kicker: "SET WINDOW",
    title: "Choose a pickup window",
    desc: "Set a perishability window so students know exactly how quickly they need to arrive.",
  },
  {
    num: "3",
    kicker: "RELAX",
    title: "Students claim and collect",
    desc: "Students reserve a portion and pick it up at your location. Close anytime with your private link.",
  },
] as const;

const STUDENT_STEPS = [
  {
    num: "1",
    kicker: "DISCOVER",
    title: "See what’s live on campus",
    desc: "Browse real-time listings posted by societies and events around UNSW.",
  },
  {
    num: "2",
    kicker: "CLAIM",
    title: "Reserve in seconds",
    desc: "Claim with your name + email — no account, no friction. Your pickup countdown starts immediately.",
  },
  {
    num: "3",
    kicker: "COLLECT",
    title: "Pick it up before it expires",
    desc: "Head to the pickup spot, show your confirmation, and enjoy food that would’ve gone to waste.",
  },
] as const;

const PARTNER_SOCIETIES = [
  "Arc @ UNSW",
  "CSESoc",
  "MedSoc",
  "FinSoc",
  "EnviroSoc",
  "Enactus UNSW",
] as const;

const CTA_HEADLINE = "Have food to give away?";
const CTA_SUB =
  "Post a listing in under 60 seconds. Students on campus will see it immediately.";

/* ─── Scroll-triggered fade-in wrapper ─── */

function FadeIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`translate-y-4 opacity-0 transition-[opacity,transform] duration-240 ease-out-expo data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/* ─── Step column (How It Works) ─── */

function StepRail({
  steps,
}: {
  steps: ReadonlyArray<{
    readonly num: string;
    readonly kicker: string;
    readonly title: string;
    readonly desc: string;
  }>;
}) {
  return (
    <ol className="relative mt-10 space-y-8">
      {/* connector line */}
      <div
        className="pointer-events-none absolute left-4.5 top-1 h-[calc(100%-0.25rem)] w-px bg-[--color-border-subtle] md:left-4.75"
        aria-hidden="true"
      />

      {steps.map((step, idx) => (
        <li
          key={step.num}
          className="group relative grid grid-cols-[44px_1fr] gap-4"
        >
          <div className="relative flex items-start justify-center">
            <div
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface] shadow-card transition-transform duration-200 ease-out-expo group-hover:-translate-y-0.5"
            >
              <span className="text-sm font-semibold text-[--color-primary]">
                {step.num}
              </span>
            </div>
          </div>

          <div className="pt-0.5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[--color-primary-mid]">
              {step.kicker}
            </p>
            <p className="mt-1 text-lg font-semibold text-[--color-text]">
              {step.title}
            </p>
            <p className="mt-1 text-sm text-[--color-text-secondary] body-relaxed">
              {step.desc}
            </p>

            {/* subtle divider rhythm for larger layouts */}
            {idx !== steps.length - 1 ? (
              <div
                className="mt-6 hidden h-px w-full bg-[--color-border-subtle] opacity-0 transition-opacity duration-200 ease-out-expo group-hover:opacity-100 md:block"
                aria-hidden="true"
              />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function PillToggle({
  value,
  onChange,
}: {
  value: "donors" | "students";
  onChange: (v: "donors" | "students") => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-[--color-border] bg-[--color-surface] p-1 shadow-card">
      <button
        type="button"
        onClick={() => onChange("donors")}
        className={`relative rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/25 ${
          value === "donors"
            ? "bg-[--color-primary] text-[--color-primary-foreground]"
            : "text-[--color-text-secondary] hover:text-[--color-text]"
        }`}
        aria-pressed={value === "donors"}
      >
        For donors
      </button>
      <button
        type="button"
        onClick={() => onChange("students")}
        className={`relative rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/25 ${
          value === "students"
            ? "bg-[--color-primary] text-[--color-primary-foreground]"
            : "text-[--color-text-secondary] hover:text-[--color-text]"
        }`}
        aria-pressed={value === "students"}
      >
        For students
      </button>
    </div>
  );
}

/* ─── Props ─── */

interface ImpactStat {
  value: string;
  label: string;
}

interface HomeContentProps {
  impactStats: ImpactStat[];
}

/* ─── Home content ─── */

export default function HomeContent({ impactStats }: HomeContentProps) {
  const router = useRouter();
  const [howMode, setHowMode] = useState<"donors" | "students">("donors");

  const howTitle = howMode === "donors" ? "For societies & clubs" : "For students";
  const howLead =
    howMode === "donors"
      ? "Post surplus food — students do the rest."
      : "Find free food fast — claim it before it’s gone.";

  const howSteps = howMode === "donors" ? DONOR_STEPS : STUDENT_STEPS;

  return (
    <>
      {/* ── 1. Hero ── */}
      <section className="relative overflow-hidden bg-[--color-bg] py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-primary)_0%,transparent_70%)] opacity-[0.04]" />

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]"
          aria-hidden="true"
        >
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves={3}
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        <PageWrapper className="relative z-10 text-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="absolute inset-x-0 top-[28%] z-10 flex flex-col items-center px-6"
            >
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[--color-primary]" />
                <span className="text-sm font-medium text-[--color-primary]">
                  Live on campus
                </span>
              </div>

              <h1 className="heading-tight mx-auto max-w-3xl font-heading text-5xl font-semibold leading-tight tracking-[-0.03em] text-[--color-text] drop-shadow-sm lg:text-6xl">
                {HERO_HEADLINE}
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-base leading-[1.7] text-[--color-text-secondary] drop-shadow-sm lg:text-lg">
                {HERO_SUB}
              </p>
            </motion.div>

            <div
              className="pointer-events-none absolute inset-0 z-5 bg-linear-to-b from-[--color-bg]/60 via-[--color-bg]/20 to-transparent"
              aria-hidden="true"
            />

            <Safari01
              className="mx-auto"
              url="plate2plate.vercel.app"
              videoSrc="https://videos.pexels.com/video-files/27180348/12091515_2560_1440_50fps.mp4"
            />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <HoverButton
              variant="primary"
              className="px-8 py-3 text-sm"
              onClick={() => router.push("/collect")}
            >
              Find Food
            </HoverButton>
            <HoverButton
              variant="secondary"
              className="px-8 py-3 text-sm"
              onClick={() => router.push("/redistribute")}
            >
              Post Surplus Food
            </HoverButton>
          </div>
        </PageWrapper>
      </section>

      {/* ── 2–3. Scroll transition: Who Are We → How It Works ── */}
      <FlowArt aria-label="Plate2Plate story scroll">
        <FlowSection
          aria-label="Who are we"
          className="min-h-0!"
          style={{ backgroundColor: "var(--p2p-surface-warm)", color: "var(--p2p-text)" }}
        >
          <div className="w-full">
            <AboutBento />
          </div>
        </FlowSection>

        <FlowSection
          aria-label="How it works"
          className="min-h-0!"
          style={{ backgroundColor: "var(--p2p-surface)", color: "var(--p2p-text)" }}
        >
          <section
            className="relative w-full overflow-hidden py-16 md:py-24 lg:py-32"
            aria-label="How it works"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-primary)_0%,transparent_62%)] opacity-[0.035]"
              aria-hidden="true"
            />

            <PageWrapper className="relative">
              <FadeIn>
                <div className="mx-auto max-w-5xl text-center">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[--color-primary-mid]">
                    ZERO WASTE. ZERO FRICTION.
                  </p>
                  <h2 className="heading-tight mt-4 font-heading text-4xl font-semibold leading-tight text-p2p-text sm:text-5xl md:text-6xl">
                    How it works
                  </h2>
                  <div className="mt-8">
                    <PillToggle value={howMode} onChange={setHowMode} />
                  </div>
                </div>

                <div className="mt-14 grid items-stretch gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
                  {/* Left: Reuse exact Safari video container + same hero stock video */}
                  <div className="relative">
                    <div className="transition-transform duration-300 ease-out-expo hover:-translate-y-0.5">
                      <Safari01
                        className="w-full max-w-none"
                        url="plate2plate.vercel.app"
                        videoSrc="https://videos.pexels.com/video-files/27180348/12091515_2560_1440_50fps.mp4"
                      />
                    </div>
                  </div>

                  {/* Right: Steps */}
                  <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-5 shadow-card md:p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-[--color-text-secondary]">
                          {howTitle.toUpperCase()}
                        </p>
                        <p className="mt-2 font-heading text-2xl font-semibold leading-snug text-[--color-text]">
                          {howLead}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      key={howMode}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <StepRail steps={howSteps} />
                    </motion.div>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                      <HoverButton
                        variant={howMode === "students" ? "primary" : "secondary"}
                        className="px-5 py-2.5 text-sm"
                        onClick={() => router.push("/collect")}
                      >
                        Find Food
                      </HoverButton>
                      <HoverButton
                        variant={howMode === "donors" ? "primary" : "secondary"}
                        className="px-5 py-2.5 text-sm"
                        onClick={() => router.push("/redistribute")}
                      >
                        Post Surplus Food
                      </HoverButton>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </PageWrapper>
          </section>
        </FlowSection>
      </FlowArt>

      {/* ── 4. Impact Stats ── */}
      <section id="impact" className="bg-p2p-surface-warm py-16 md:py-24 lg:py-32">
        <PageWrapper>
          <FadeIn>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {impactStats.map((stat) => (
                <div key={stat.label} className="border-t-2 border-p2p-primary pt-6">
                  <p className="heading-tight font-heading text-4xl font-semibold text-p2p-text md:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-p2p-text-secondary">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </PageWrapper>
      </section>

      {/* ── 5. Partner Societies ── */}
      <section className="bg-p2p-surface py-16 md:py-24 lg:py-32">
        <PageWrapper>
          <FadeIn className="text-center">
            <h2 className="text-3xl font-semibold text-p2p-text md:text-4xl">
              Trusted by UNSW societies
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {PARTNER_SOCIETIES.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-p2p-border bg-p2p-surface px-5 py-2 text-sm font-medium text-p2p-text-secondary"
                >
                  {name}
                </span>
              ))}
            </div>
          </FadeIn>
        </PageWrapper>
      </section>

      {/* ── 6. Footer CTA Strip ── */}
      <section className="bg-p2p-primary py-16 md:py-24 lg:py-32">
        <PageWrapper>
          <FadeIn className="text-center">
            <h2 className="text-3xl font-semibold text-p2p-surface-warm md:text-4xl">
              {CTA_HEADLINE}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-p2p-surface-warm/80">
              {CTA_SUB}
            </p>
            <Link
              href="/redistribute"
              className="mt-8 inline-flex h-12 items-center rounded-xl border-2 border-p2p-surface-warm bg-transparent px-8 text-base font-medium text-p2p-surface-warm transition-[background-color,transform] duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-surface-warm focus-visible:ring-offset-2 focus-visible:ring-offset-p2p-primary active:scale-[0.98]"
            >
              Post Surplus Food
            </Link>
          </FadeIn>
        </PageWrapper>
      </section>
    </>
  );
}
