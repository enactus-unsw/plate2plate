import { PageWrapper } from "@/components/layout/PageWrapper";
import { ArcEventCard, type ArcEvent } from "@/components/listings/ArcEventCard";

const WEEK_2_EVENTS: ArcEvent[] = [
  {
    id: "brekkie-tue",
    title: "Breakfast Club",
    description: "Start your morning right with free breakfast and wellness tips from the Arc team.",
    date: "Tue 9 June 2026",
    time: "9:30 AM – 11:30 AM",
    location: "The Quad, Kensington Campus",
    category: "Free Food",
    isRecurring: true,
  },
  {
    id: "foodhub-paddy",
    title: "Food Hub (Paddington)",
    description: "Free pantry staples, fresh produce, and hygiene products for Paddington students.",
    date: "Tue 9 June 2026",
    time: "12:00 PM – 2:00 PM",
    location: "D Block Entrance, Paddington Campus",
    category: "Pantry",
    link: "https://www.arc.unsw.edu.au/foodhub",
  },
  {
    id: "foodhub-kenso-wed",
    title: "Food Hub (Kensington)",
    description: "Free groceries and pantry essentials. Please register on Humanitix before visiting.",
    date: "Wed 10 June 2026",
    time: "2:00 PM – 4:00 PM",
    location: "Gate 2, Kensington Campus",
    category: "Pantry",
    link: "https://www.arc.unsw.edu.au/foodhub",
  },
  {
    id: "clubs-takeover",
    title: "Clubs Takeover",
    description: "A huge celebration of student life with free food and activities from various UNSW clubs.",
    date: "Wed 10 June 2026",
    time: "11:00 AM – 4:00 PM",
    location: "Alumni East, Kensington Campus",
    category: "Social Event",
  },
  {
    id: "culture-cafe",
    title: "Culture Café: China",
    description: "Experience the vibrant culture and delicious traditional food of China at the Roundhouse.",
    date: "Thu 11 June 2026",
    time: "12:00 PM – 2:00 PM",
    location: "The Roundhouse",
    category: "Culture",
  },
  {
    id: "foodhub-kenso-fri",
    title: "Food Hub (Kensington)",
    description: "Weekly pantry session providing free food support to students in need.",
    date: "Fri 12 June 2026",
    time: "12:00 PM – 2:00 PM",
    location: "Gate 2, Kensington Campus",
    category: "Pantry",
    link: "https://www.arc.unsw.edu.au/foodhub",
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
