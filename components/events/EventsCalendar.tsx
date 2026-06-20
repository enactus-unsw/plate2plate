"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CalendarX,
} from "lucide-react";
import type { RubricEvent } from "@/lib/rubric";

// ---------------------------------------------------------------------------
// Date helpers (all client-side, no timezone conversion needed — dates are
// pre-formatted by the server in Sydney time)
// ---------------------------------------------------------------------------

/** Return the Monday of the week containing `date` (local time). */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** "YYYY-MM-DD" from a Date (local time, matching the Sydney-formatted strings
 *  from the server — acceptable since both are Sydney-local when the user is in
 *  Sydney, and for display purposes the slight offset on servers is negligible). */
function toDateStr(date: Date): string {
  return date.toLocaleDateString("en-CA"); // en-CA → "YYYY-MM-DD"
}

/** "3 Jun – 9 Jun 2026" */
function formatWeekLabel(start: Date, end: Date): string {
  const s = `${start.getDate()} ${MONTH_LABELS[start.getMonth()]}`;
  const e = `${end.getDate()} ${MONTH_LABELS[end.getMonth()]} ${end.getFullYear()}`;
  return `${s} – ${e}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// ── Event Pill ────────────────────────────────────────────────────────────────

function EventPill({ event }: { event: RubricEvent }) {
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-0.5 rounded-lg border border-p2p-primary/20 bg-p2p-primary-light p-2.5 transition-[background-color,box-shadow,transform] duration-150 hover:bg-p2p-primary hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-1 active:scale-[0.98]"
    >
      <span className="font-mono text-[10px] font-medium text-p2p-primary-mid group-hover:text-white/70">
        {event.timeStr}
      </span>
      <span className="line-clamp-2 text-xs font-semibold leading-snug text-p2p-text group-hover:text-white">
        {event.title}
      </span>
      <span className="flex items-center gap-1 line-clamp-1 text-[10px] text-p2p-text-secondary group-hover:text-white/80">
        <span className="line-clamp-1">{event.society}</span>
        <ExternalLink size={9} className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </span>
    </a>
  );
}

// ── Mobile Agenda ─────────────────────────────────────────────────────────────
// Touch-friendly stacked list shown below the `sm` breakpoint instead of the
// 7-column grid (which relies on hover popovers and horizontal scrolling).

function MobileAgenda({
  weekDays,
  eventsByDate,
  todayStr,
}: {
  weekDays: Date[];
  eventsByDate: Map<string, RubricEvent[]>;
  todayStr: string;
}) {
  const daysWithEvents = weekDays.filter(
    (d) => (eventsByDate.get(toDateStr(d))?.length ?? 0) > 0,
  );

  if (daysWithEvents.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {daysWithEvents.map((day) => {
        const dateStr = toDateStr(day);
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;
        const dayEvents = eventsByDate.get(dateStr) ?? [];
        const dayIndex = (day.getDay() + 6) % 7; // Mon-first index

        return (
          <div
            key={dateStr}
            className={[
              "rounded-xl border border-p2p-border bg-p2p-surface p-3 shadow-card",
              isPast ? "opacity-60" : "",
            ].join(" ")}
          >
            <div className="mb-2.5 flex items-center gap-2.5">
              <span
                className={[
                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                  isToday
                    ? "bg-p2p-primary text-white"
                    : "bg-p2p-surface-warm text-p2p-text",
                ].join(" ")}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-p2p-text-secondary">
                  {DAY_LABELS[dayIndex]}
                </span>
                <span className="text-[10px] text-p2p-text-disabled">
                  {MONTH_LABELS[day.getMonth()]}
                </span>
              </div>
              {isToday && (
                <span className="ml-auto rounded-full bg-p2p-primary-light px-2 py-0.5 text-[10px] font-semibold text-p2p-primary">
                  Today
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {dayEvents.map((ev) => (
                <a
                  key={ev.id + ev.isoDateTime}
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 rounded-lg border border-p2p-primary/20 bg-p2p-primary-light p-2.5 transition-[background-color,transform] duration-150 hover:bg-p2p-primary-light/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-1 active:scale-[0.98]"
                >
                  <span className="font-mono text-[10px] font-medium text-p2p-primary-mid">
                    {ev.timeStr}
                  </span>
                  <span className="text-xs font-semibold leading-snug text-p2p-text">
                    {ev.title}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-p2p-text-secondary">
                    <span className="line-clamp-1">{ev.society}</span>
                    <ExternalLink size={10} className="ml-auto shrink-0" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Week Strip ────────────────────────────────────────────────────────────────

function WeekStrip({
  todayDate,
  activeWeekStart,
  eventsByDate,
  maxDateStr,
  onSelect,
}: {
  todayDate: Date;
  activeWeekStart: Date;
  eventsByDate: Map<string, RubricEvent[]>;
  maxDateStr: string;
  onSelect: (d: Date) => void;
}) {
  const activeStr = toDateStr(activeWeekStart);

  const weeks = useMemo(() => {
    const base = getWeekStart(todayDate);
    return Array.from({ length: 5 }, (_, i) => {
      const start = addDays(base, i * 7);
      let hasEvents = false;
      for (let d = 0; d < 7; d++) {
        if ((eventsByDate.get(toDateStr(addDays(start, d)))?.length ?? 0) > 0) {
          hasEvents = true;
          break;
        }
      }
      return {
        start,
        startStr: toDateStr(start),
        hasEvents,
        label: `${start.getDate()} ${MONTH_LABELS[start.getMonth()]}`,
      };
    });
  }, [todayDate, eventsByDate]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
      <span className="shrink-0 text-[11px] font-medium text-p2p-text-disabled">
        Jump to:
      </span>
      {weeks.map((w) => {
        const isActive = w.startStr === activeStr;
        const isDisabled = w.startStr > maxDateStr;
        return (
          <button
            key={w.startStr}
            onClick={() => onSelect(w.start)}
            disabled={isDisabled}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-1 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40",
              isActive
                ? "bg-p2p-primary text-white"
                : w.hasEvents
                  ? "border border-p2p-primary/30 bg-p2p-primary-light text-p2p-primary hover:bg-p2p-primary hover:text-white"
                  : "border border-p2p-border bg-p2p-bg text-p2p-text-disabled hover:bg-p2p-surface-warm",
            ].join(" ")}
          >
            <span
              className={[
                "size-1.5 rounded-full",
                isActive
                  ? "bg-white"
                  : w.hasEvents
                    ? "bg-p2p-primary"
                    : "bg-p2p-border",
              ].join(" ")}
            />
            {w.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface EventsCalendarProps {
  events: RubricEvent[];
  /** The furthest date string (YYYY-MM-DD) covered by the pre-fetched data */
  maxDateStr: string;
}

export function EventsCalendar({ events, maxDateStr }: EventsCalendarProps) {
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => toDateStr(todayDate), [todayDate]);

  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(todayDate),
  );
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [animKey, setAnimKey] = useState(0);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Index events by dateStr for O(1) lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, RubricEvent[]>();
    for (const ev of events) {
      const bucket = map.get(ev.dateStr) ?? [];
      bucket.push(ev);
      map.set(ev.dateStr, bucket);
    }
    return map;
  }, [events]);

  const isCurrentWeek =
    toDateStr(weekStart) === toDateStr(getWeekStart(todayDate));
  const canGoNext = toDateStr(addDays(weekStart, 7)) <= maxDateStr;
  const canGoPrev = !isCurrentWeek;

  const weekHasEvents = weekDays.some(
    (d) => (eventsByDate.get(toDateStr(d))?.length ?? 0) > 0,
  );

  // First event week after the currently displayed week
  const nextWeekWithEvents = useMemo(() => {
    const weekEndStr = toDateStr(weekDays[6]);
    for (const ev of events) {
      if (ev.dateStr > weekEndStr) {
        return getWeekStart(new Date(ev.dateStr + "T00:00:00"));
      }
    }
    return null;
  }, [events, weekDays]);

  // Navigate to a specific week with slide direction detection
  function navigateTo(newStart: Date) {
    const dir = toDateStr(newStart) >= toDateStr(weekStart) ? "right" : "left";
    setSlideDir(dir);
    setAnimKey((k) => k + 1);
    setWeekStart(newStart);
  }

  // Keyboard ← → navigation
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlideDir("left");
        setAnimKey((k) => k + 1);
        setWeekStart((d) => {
          const prev = addDays(d, -7);
          return toDateStr(prev) >= toDateStr(getWeekStart(new Date()))
            ? prev
            : d;
        });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSlideDir("right");
        setAnimKey((k) => k + 1);
        setWeekStart((d) => {
          const next = addDays(d, 7);
          return toDateStr(next) <= maxDateStr ? next : d;
        });
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [maxDateStr]);

  const animClass =
    slideDir === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Navigation bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo(addDays(weekStart, -7))}
            disabled={!canGoPrev}
            aria-label="Previous week"
            className="inline-flex size-8 items-center justify-center rounded-full border border-p2p-border bg-p2p-surface text-p2p-text-secondary transition-[background-color,transform] duration-150 hover:bg-p2p-primary-light hover:text-p2p-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="min-w-[160px] text-center text-sm font-medium text-p2p-text">
            {formatWeekLabel(weekStart, weekDays[6])}
          </span>

          <button
            onClick={() => navigateTo(addDays(weekStart, 7))}
            disabled={!canGoNext}
            aria-label="Next week"
            className="inline-flex size-8 items-center justify-center rounded-full border border-p2p-border bg-p2p-surface text-p2p-text-secondary transition-[background-color,transform] duration-150 hover:bg-p2p-primary-light hover:text-p2p-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <span className="hidden text-[11px] text-p2p-text-disabled sm:block">
          Use ← → keys to navigate
        </span>

        {!isCurrentWeek && (
          <button
            onClick={() => navigateTo(getWeekStart(todayDate))}
            className="rounded-full border border-p2p-primary/30 bg-p2p-primary-light px-3.5 py-1.5 text-xs font-medium text-p2p-primary transition-[background-color,transform] duration-150 hover:bg-p2p-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Today
          </button>
        )}
      </div>

      {/* ── Week strip ─────────────────────────────────────────────────── */}
      <WeekStrip
        todayDate={todayDate}
        activeWeekStart={weekStart}
        eventsByDate={eventsByDate}
        maxDateStr={maxDateStr}
        onSelect={navigateTo}
      />

      {/* ── Mobile agenda (stacked, tap-friendly) ──────────────────────── */}
      <div key={`agenda-${animKey}`} className={`sm:hidden ${animClass}`}>
        <MobileAgenda
          weekDays={weekDays}
          eventsByDate={eventsByDate}
          todayStr={todayStr}
        />
        {!weekHasEvents &&
          !nextWeekWithEvents &&
          toDateStr(weekStart) <= maxDateStr && (
            <div className="flex flex-col items-center rounded-xl border border-p2p-border bg-p2p-surface-warm py-8 text-center">
              <p className="text-sm font-semibold text-p2p-text">
                No events this week
              </p>
              <p className="mt-1 text-xs text-p2p-text-secondary">
                Check back soon — events refresh every 5 minutes.
              </p>
            </div>
          )}
      </div>

      {/* ── Calendar grid (sm and up) ──────────────────────────────────── */}
      <div className="hidden overflow-x-auto rounded-xl border border-p2p-border shadow-card sm:block">
        <div
          key={animKey}
          className={`grid min-w-[640px] grid-cols-7 divide-x divide-p2p-border ${animClass}`}
        >
          {weekDays.map((day, i) => {
            const dateStr = toDateStr(day);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const dayEvents = eventsByDate.get(dateStr) ?? [];
            const isWeekend = i >= 5;

            return (
              <div
                key={dateStr}
                className={[
                  "flex flex-col",
                  isWeekend ? "bg-p2p-bg" : "bg-p2p-surface",
                ].join(" ")}
              >
                {/* Day header */}
                <div
                  className={[
                    "flex flex-col items-center border-b px-1.5 py-2.5 text-center",
                    isToday
                      ? "border-p2p-primary/30 bg-p2p-primary"
                      : "border-p2p-border bg-p2p-surface-warm",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-[10px] font-semibold uppercase tracking-widest",
                      isToday ? "text-white/80" : "text-p2p-text-secondary",
                    ].join(" ")}
                  >
                    {DAY_LABELS[i]}
                  </span>
                  <span
                    className={[
                      "mt-0.5 text-lg font-bold leading-none",
                      isToday
                        ? "text-white"
                        : isPast
                          ? "text-p2p-text-disabled"
                          : "text-p2p-text",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </span>
                  <span
                    className={[
                      "text-[10px]",
                      isToday ? "text-white/70" : "text-p2p-text-secondary",
                    ].join(" ")}
                  >
                    {MONTH_LABELS[day.getMonth()]}
                  </span>
                  {/* Event count chip */}
                  {dayEvents.length > 0 && (
                    <span
                      className={[
                        "mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none",
                        isToday
                          ? "bg-white/20 text-white"
                          : "bg-p2p-primary text-white",
                      ].join(" ")}
                    >
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div
                  className={[
                    "flex min-h-32 flex-col gap-1.5 p-1.5",
                    isPast ? "opacity-50" : "",
                  ].join(" ")}
                >
                  {dayEvents.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-6">
                      <span className="text-[11px] text-p2p-text-disabled">
                        —
                      </span>
                    </div>
                  ) : (
                    dayEvents.map((ev) => (
                      <EventPill
                        key={ev.id + ev.isoDateTime}
                        event={ev}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Empty week CTA ─────────────────────────────────────────────── */}
      {!weekHasEvents && nextWeekWithEvents && (
        <div className="flex flex-col items-center rounded-xl border border-p2p-border bg-p2p-surface-warm py-8 text-center">
          <p className="mb-1.5 text-sm font-semibold text-p2p-text">
            No events this week
          </p>
          <p className="mb-4 text-xs text-p2p-text-secondary">
            Next{" "}
            <span className="font-medium text-p2p-primary">
              Party/BBQ/Social
            </span>{" "}
            events start the week of{" "}
            <span className="font-medium text-p2p-text">
              {nextWeekWithEvents.getDate()}{" "}
              {MONTH_LABELS[nextWeekWithEvents.getMonth()]}
            </span>
          </p>
          <button
            onClick={() => navigateTo(nextWeekWithEvents)}
            className="inline-flex items-center gap-1.5 rounded-full bg-p2p-primary px-4 py-2 text-xs font-medium text-white transition-[background-color,transform] duration-150 hover:bg-p2p-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Jump to next events
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Beyond fetched range ────────────────────────────────────────── */}
      {toDateStr(weekStart) > maxDateStr && (
        <div className="mt-2 flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 rounded-full bg-p2p-surface-warm p-3">
            <CalendarX size={24} className="text-p2p-text-disabled" />
          </div>
          <p className="text-sm font-medium text-p2p-text">
            No event data available this far ahead
          </p>
          <p className="mt-1 text-xs text-p2p-text-secondary">
            Event listings are refreshed every 5 minutes.
          </p>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <p className="text-xs text-p2p-text-disabled">
        Data sourced from{" "}
        <a
          href="https://campus.hellorubric.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-p2p-primary"
        >
          campus.hellorubric.com
        </a>
        .
        <span className="hidden sm:inline">
          {" "}
          Click any event to view it on Rubric. Use ← → keys to navigate.
        </span>
        <span className="sm:hidden"> Tap any event to view it on Rubric.</span>
      </p>
    </div>
  );
}
