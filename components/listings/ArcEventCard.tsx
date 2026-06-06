"use client";

import Image from "next/image";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";

export interface ArcEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  link?: string;
  isRecurring?: boolean;
}

interface ArcEventCardProps {
  event: ArcEvent;
}

export function ArcEventCard({ event }: ArcEventCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-p2p-border bg-p2p-surface shadow-card transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-p2p-primary focus-within:ring-offset-2 active:scale-[0.98]">
      {/* Photo - matching ListingCard style */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
        <Image
          src={event.image || "/placeholder-food.png"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute right-3 top-3 inline-flex items-center rounded-full bg-p2p-primary-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-p2p-primary shadow-sm">
          {event.category}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-semibold text-p2p-text line-clamp-2 group-hover:text-p2p-primary transition-colors duration-200">
          {event.title}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-p2p-text-secondary line-clamp-2">
          {event.description}
        </p>

        {/* Metadata Stack */}
        <div className="mt-auto space-y-2 pt-4 border-t border-p2p-border-subtle">
          <div className="flex items-center gap-2 text-xs text-p2p-text-secondary">
            <Calendar size={14} className="shrink-0 text-p2p-primary/60" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-p2p-text-secondary">
            <Clock size={14} className="shrink-0 text-p2p-primary/60" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-p2p-text-secondary">
            <MapPin size={14} className="shrink-0 text-p2p-primary/60" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Action Link */}
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-p2p-primary hover:underline underline-offset-4"
          >
            Learn More
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  );
}
