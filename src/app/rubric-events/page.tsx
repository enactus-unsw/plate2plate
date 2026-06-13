import { Calendar } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { fetchRubricEvents } from "@/lib/rubric";
import Link from "next/link";

// Revalidate this page via ISR every 5 minutes
export const revalidate = 300;

export const metadata = {
  title: "Campus Events — FoodCompass",
  description:
    "Upcoming UNSW campus events on Rubric — potential sources of surplus food to rescue.",
};

/** "YYYY-MM-DD" offset by `days` from today (server-side UTC, close enough
 *  to Sydney for a multi-week range). */
function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const FOOD_EVENT_REGEX =
  /\b(barbecue|barbeque|bbq|sizzle|free food|lunch|dinner|breakfast|brunch|bbq|barbecue|pizza|catering|catered|snack|meal|feast|roast|roost)\b/i;
const SOCIAL_NOISE_REGEX = /\b(club|night|after party)\b/i;

/** Check if an event is paid based on the info field from Rubric API. */
function isPaidEvent(info?: string): boolean {
  if (!info) return false;
  const trimmed = info.trim();
  if (trimmed.toLowerCase() === "free") return false;
  if (/^\$0\.00\s*-\s*\$0\.00$/.test(trimmed)) return false;
  return /\$\d+\.\d{2}|[Pp]aid|[Tt]icket/.test(info);
}

function isFoodRelatedEvent(event: {
  title: string;
  society: string;
  category: string;
  info: string;
}): boolean {
  const searchableText = `${event.title} ${event.society} ${event.category}`;
  return (
    FOOD_EVENT_REGEX.test(searchableText) &&
    !SOCIAL_NOISE_REGEX.test(searchableText) &&
    !isPaidEvent(event.info)
  );
}

export default async function EventsPage() {
  const dateFrom = offsetDate(0); // today
  const dateTo = offsetDate(35); // 5 weeks ahead

  const events = (
    await fetchRubricEvents(dateFrom, dateTo).catch(() => [])
  ).filter(isFoodRelatedEvent);

  return (
    <PageWrapper className="py-8 sm:py-12 md:py-16">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start gap-4">
        <div className="hidden rounded-xl bg-p2p-primary-light p-3 sm:block">
          <Calendar size={22} className="text-p2p-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-p2p-text md:text-4xl">
            Campus Events
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-p2p-text-secondary">
            Upcoming UNSW events from{" "}
            <a
              href="https://campus.hellorubric.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-p2p-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-p2p-primary"
            >
              Rubric
            </a>
            . Keep an eye out and check{" "}
            <Link
              href="/collect"
              className="font-medium text-p2p-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-p2p-primary"
            >
              the collect feed
            </Link>{" "}
            for active listings.
          </p>
        </div>
      </div>

      {/* ── Calendar ──────────────────────────────────────────────────── */}
      <EventsCalendar events={events} maxDateStr={dateTo} />
    </PageWrapper>
  );
}
