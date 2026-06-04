import { PageWrapper } from "@/components/layout/PageWrapper";
import { ArcEventCard, type ArcEvent } from "@/components/listings/ArcEventCard";

const WEEK_2_EVENTS: ArcEvent[] = [
  {
    id: "foodhub-paddy",
    title: "Food Hub (Paddington)",
    description: "Free pantry staples, fresh produce, and hygiene products for Paddington students.",
    date: "Tue 9 June 2026",
    time: "12:00 PM – 2:00 PM",
    location: "D Block Entrance, Paddington Campus",
    category: "Pantry",
    link: "https://events.humanitix.com/food-hub-paddington-or-unsw",
  },
  {
    id: "foodhub-kenso-wed",
    title: "Food Hub (Kensington)",
    description: "Free groceries and pantry essentials. Please register on Humanitix before visiting.",
    date: "Wed 10 June 2026",
    time: "2:00 PM – 4:00 PM",
    location: "Gate 2, Kensington Campus",
    category: "Pantry",
    link: "https://events.humanitix.com/food-hub-unsw",
  },
  {
    id: "arc-picnic",
    title: "Arc Picnic | Arc Savers",
    description: "Take a break between classes at the Arc Savers Picnic to unwind with free food, new friends, and a relaxing campus vibe.",
    date: "Wed 10 June 2026",
    time: "12:00 PM – 3:00 PM",
    location: "Helen Maguire Lawn, Quadrangle Building (E15)",
    category: "Social Event",
    link: "https://events.humanitix.com/arc-picnic-savers-26t2"
  },
  {
    id: "foodhub-kenso-fri",
    title: "Food Hub (Kensington)",
    description: "Weekly pantry session providing free food support to students in need.",
    date: "Fri 12 June 2026",
    time: "12:00 PM – 2:00 PM",
    location: "Gate 2, Kensington Campus",
    category: "Pantry",
    link: "https://events.humanitix.com/food-hub-unsw",
  },
];

export default function ArcEventsPage() {
  return (
    <PageWrapper className="py-16 md:py-24">
      <header className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="text-4xl font-semibold text-p2p-text sm:text-5xl md:text-6xl">
          Arc Food Events
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-p2p-text-secondary">
          Beyond individual rescue listings, Arc and UNSW run regular food programs. 
          Here&apos;s what&apos;s happening in <span className="font-semibold text-p2p-primary">Week 2</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WEEK_2_EVENTS.map((event) => (
          <ArcEventCard key={event.id} event={event} />
        ))}
      </div>

      <section className="mt-24 rounded-2xl border border-p2p-border bg-p2p-surface-warm p-8 text-center md:p-12">
        <h2 className="text-2xl font-semibold text-p2p-text">Need more support?</h2>
        <p className="mx-auto mt-4 max-w-xl text-p2p-text-secondary">
          The Food Hub lockers at Kensington are accessible 24/7 for students who can&apos;t make it during session times.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="https://www.arc.unsw.edu.au/foodhub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-full bg-p2p-primary px-8 text-sm font-medium text-white transition-all hover:bg-p2p-primary-hover active:scale-[0.98]"
          >
            Visit Arc Food Hub
          </a>
        </div>
      </section>
    </PageWrapper>
  );
}
