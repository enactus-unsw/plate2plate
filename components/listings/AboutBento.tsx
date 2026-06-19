"use client";

import { Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { BentoGridShowcase } from "@/components/ui/bento-grid-showcase";
import Image from "next/image";

import enactus from "../../brand_assets/enactus.jpg";
import Link from "next/link";

const CARD_BASE =
  "rounded-2xl border border-p2p-border bg-p2p-surface p-6 shadow-card transition-shadow transition-transform duration-200 hover:shadow-card-hover hover:-translate-y-0.5";

function PullQuoteCard() {
  return (
    <div
      className={`${CARD_BASE} relative flex h-full flex-col justify-between overflow-hidden bg-p2p-surface-warm`}
    >
      {/* Decorative large quote mark */}
      <span
        className="pointer-events-none absolute -right-2 -top-4 select-none font-heading text-[9rem] leading-none text-p2p-primary opacity-[0.07]"
        aria-hidden="true"
      >
        &rdquo;
      </span>
      <div className="relative">
        <div className="mb-6 h-[3px] w-7 rounded-full bg-p2p-primary" />
        <blockquote className="font-heading text-2xl leading-snug tracking-tight text-p2p-text md:text-3xl">
          &ldquo;1 in 5 UNSW students experience food insecurity. Campus events
          waste tonnes every year.{" "}
          <span className="text-p2p-primary">We built the bridge.</span>&rdquo;
        </blockquote>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-p2p-border" />
        <p className="mt-8 text-xs text-p2p-text-secondary">
          — Enactus UNSW, FoodCompass
        </p>
      </div>
    </div>
  );
}

function MissionCard() {
  return (
    <div
      className={`${CARD_BASE} relative flex h-full flex-col justify-between overflow-hidden`}
    >
      <div>
        <div className="mb-5 h-[3px] w-7 rounded-full bg-p2p-primary" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-p2p-text-secondary">
          Our Mission
        </p>
        <p className="font-heading text-xl font-semibold leading-snug tracking-tight text-p2p-text md:text-2xl">
          Turning campus surplus into{" "}
          <span className="text-p2p-primary">sustenance</span>.
        </p>
        <p className="mt-4 text-sm leading-[1.7] text-p2p-text-secondary">
          We connect UNSW societies and clubs with nearby students in real time,
          so food that would go to waste feeds someone instead.
        </p>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-p2p-primary-light px-3 py-1.5">
        <Leaf className="h-3.5 w-3.5 text-p2p-primary" />
        <span className="text-xs font-medium text-p2p-primary">
          Zero food wasted
        </span>
      </div>
    </div>
  );
}

function StatisticCard() {
  return (
    <div className={`${CARD_BASE} relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--p2p-primary)_0%,transparent_65%)] opacity-[0.07]" />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-p2p-text-secondary">
            Food Wasted Annually
          </p>
          <span className="font-heading text-5xl font-semibold text-p2p-primary md:text-6xl">
            20–30%
          </span>
          <p className="mt-3 text-sm leading-[1.7] text-p2p-text-secondary">
            of campus event food is over-catered and goes uneaten every year at
            UNSW.
          </p>
        </div>
        <div className="mt-8">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-p2p-text-secondary">Rescued</span>
            <span className="text-xs font-medium text-p2p-primary">
              vs wasted
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-p2p-primary-light">
            <motion.div
              className="h-full rounded-full bg-p2p-primary"
              initial={{ width: 0 }}
              whileInView={{ width: "75%" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EnactusCard() {
  return (
    <div
      className={`${CARD_BASE} relative flex h-full flex-col justify-between overflow-hidden`}
    >
      <Leaf className="pointer-events-none absolute -bottom-4 -right-4 h-40 w-40 text-p2p-primary opacity-[0.06]" />
      <div className="relative">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-p2p-text-secondary">
          Who Built This
        </p>
        <Link href="https://enactusunsw.org" target="_blank">
          <Image
            src={enactus}
            width={150}
            height={150}
            alt="enactus logo"
            className="mb-6"
          />
        </Link>
        <p className="text-sm leading-[1.7] text-p2p-text-secondary">
          A student-led social enterprise team using business skills to create a
          better, more sustainable world on campus.
        </p>
      </div>
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
        <motion.div
          className="mb-14 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.16em] text-p2p-primary-mid"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            Enactus UNSW
          </motion.p>

          <motion.h2
            className="mt-3 font-heading text-4xl font-semibold tracking-[-0.03em] text-p2p-text sm:text-5xl"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {["Who", "Are", "We"].map((word) => (
              <span key={word} className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "110%" },
                    visible: {
                      y: 0,
                      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  {word}&nbsp;
                </motion.span>
              </span>
            ))}
          </motion.h2>

          <motion.div
            className="mx-auto mt-4 flex max-w-xs items-center gap-3"
            variants={{
              hidden: { opacity: 0, scaleX: 0.4 },
              visible: {
                opacity: 1,
                scaleX: 1,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            <div className="h-px flex-1 bg-p2p-border" />
            <div className="h-1.5 w-1.5 rounded-full bg-p2p-primary" />
            <div className="h-px flex-1 bg-p2p-border" />
          </motion.div>

          <motion.p
            className="mt-4 text-base leading-[1.7] text-p2p-text-secondary"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            The team and mission behind Plate2Plate.
          </motion.p>
        </motion.div>

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
