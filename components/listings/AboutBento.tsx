"use client";

import { Leaf } from "lucide-react";
import { BentoGridShowcase } from "@/components/ui/bento-grid-showcase";

const CARD_BASE =
  "rounded-2xl border border-p2p-border bg-p2p-surface p-6 shadow-card transition-shadow transition-transform duration-200 hover:shadow-card-hover hover:-translate-y-0.5";

function PullQuoteCard() {
  return (
    <div
      className={`${CARD_BASE} flex h-full flex-col justify-between bg-p2p-surface-warm`}
    >
      <div>
        <div className="mb-6 h-[3px] w-7 rounded-full bg-p2p-primary" />
        <blockquote className="font-heading text-2xl leading-snug tracking-tight text-p2p-text md:text-3xl">
          &ldquo;1 in 5 UNSW students experience food insecurity. Campus events
          waste tonnes every year. We built the bridge.&rdquo;
        </blockquote>
      </div>
      <p className="mt-8 text-xs text-p2p-text-secondary">
        — Enactus UNSW, Plate2Plate
      </p>
    </div>
  );
}

function MissionCard() {
  return (
    <div className={`${CARD_BASE} flex h-full flex-col`}>
      <p className="mb-3 text-xs uppercase tracking-widest text-p2p-text-secondary">
        Our Mission
      </p>
      <p className="text-sm leading-[1.7] text-p2p-text-secondary">
        Plate2Plate is a campus food rescue platform built by Enactus UNSW. We
        connect societies and clubs with students in real time — turning surplus
        into sustenance before it becomes waste.
      </p>
    </div>
  );
}

function StatisticCard() {
  return (
    <div className={`${CARD_BASE} relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--p2p-primary)_0%,transparent_70%)] opacity-[0.08]" />
      <div className="relative min-h-[200px]">
        <p className="mb-4 text-xs uppercase tracking-widest text-p2p-text-secondary">
          Food Wasted Annually
        </p>
        <span className="font-heading text-5xl font-medium text-p2p-primary md:text-6xl">
          20–30%
        </span>
        <p className="mt-3 text-sm text-p2p-text-secondary">
          of campus event food is over-catered and goes uneaten every year at
          UNSW
        </p>
      </div>
    </div>
  );
}

function EnactusCard() {
  return (
    <div className={`${CARD_BASE} relative overflow-hidden`}>
      <div className="relative min-h-[200px]">
        <p className="mb-4 text-xs uppercase tracking-widest text-p2p-text-secondary">
          Who Built This
        </p>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-p2p-primary-light px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-p2p-primary-mid opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-p2p-primary" />
          </span>
          <span className="text-xs font-medium text-p2p-primary">
            Enactus UNSW
          </span>
        </div>
        <p className="text-sm leading-[1.7] text-p2p-text-secondary">
          A student-led social enterprise team using business skills to create a
          better, more sustainable world on campus.
        </p>
      </div>
      <Leaf className="absolute bottom-4 right-4 h-12 w-12 text-p2p-primary opacity-10" />
    </div>
  );
}

export function AboutBento() {
  return (
    <section
      id="about"
      className="scroll-mt-28 bg-p2p-surface-warm py-16 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-p2p-text">
            Who Are We
          </h2>
          <p className="mt-3 text-base text-p2p-text-secondary">
            The team and mission behind Plate2Plate.
          </p>
        </div>

        <BentoGridShowcase
          topLeft={<PullQuoteCard />}
          topRight={<MissionCard />}
          bottomLeft={<StatisticCard />}
          bottomRight={<EnactusCard />}
          className="gap-5"
        />
      </div>
    </section>
  );
}
