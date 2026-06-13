/**
 * lib/rubric.ts — Server-side utility to fetch upcoming events from the
 * Rubric campus events platform (campus.hellorubric.com).
 *
 * Uses Rubric's internal POST API — no browser rendering required.
 * Intended to be called only from Server Components (never imported in
 * client components).
 */

export interface RubricEvent {
  id: string;
  title: string;
  society: string;
  category: string;
  /** YYYY-MM-DD in Australia/Sydney timezone */
  dateStr: string;
  /** e.g. "6:30 AM" in Australia/Sydney timezone */
  timeStr: string;
  /** ISO timestamp (UTC) */
  isoDateTime: string;
  /** Full URL to the event on campus.hellorubric.com */
  url: string;
  /** Pricing info from Rubric API, e.g. "$0.00 - $11.00" or "Free" */
  info: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = "https://api.hellorubric.com/";
const FRONTEND_BASE = "https://campus.hellorubric.com";
const UNIVERSITY_ID = "5"; // Arc @ UNSW
const PAGE_SIZE = 50;
const MAX_PAGES = 15;

const HEADERS: Record<string, string> = {
  "Content-Type": "application/x-www-form-urlencoded",
  Origin: "https://campus.hellorubric.com",
  Referer: "https://campus.hellorubric.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** POST to the Rubric API, cached by Next.js for 5 minutes. */
async function postRubric(
  endpoint: string,
  details: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({
    details: JSON.stringify({
      ...details,
      device: "web_portal",
      version: 4,
      timestamp: Date.now(),
    }),
    endpoint,
  });

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: HEADERS,
    body: body.toString(),
    next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
  });

  if (!res.ok) {
    throw new Error(`Rubric API responded with ${res.status}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

/** Extract numeric event id from a destination string like "/?eid=63892". */
function extractEventId(destination: string): string {
  const m = /eid=(\d+)/.exec(destination);
  return m ? m[1] : "";
}

/** Check if an event is paid based on the info field from Rubric API. */
function isPaidEvent(info?: string): boolean {
  if (!info) return false;
  // If info contains "Free" or "$0.00" as the only price, it's free
  // Examples: "Free", "$0.00", "$0.00 - $0.00"
  const trimmed = info.trim();
  if (trimmed.toLowerCase() === "free") return false;
  // Check if it's a range starting with $0.00
  if (/^\$0\.00\s*-\s*\$0\.00$/.test(trimmed)) return false;
  // Any other pricing info suggests it's paid
  return /\$\d+\.\d{2}|[Pp]aid|[Tt]icket/.test(info);
}

/** Format a Date as "YYYY-MM-DD" in the Sydney timezone. */
function toSydneyDateStr(date: Date): string {
  // en-CA locale produces ISO-style "YYYY-MM-DD"
  return date.toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
}

/** Format a Date as "h:mm AM/PM" in the Sydney timezone. */
function toSydneyTimeStr(date: Date): string {
  return date.toLocaleTimeString("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all upcoming UNSW events from Rubric within the given date range.
 *
 * @param dateFrom  Inclusive start date, "YYYY-MM-DD" (Sydney time)
 * @param dateTo    Inclusive end date,   "YYYY-MM-DD" (Sydney time)
 */
export async function fetchRubricEvents(
  dateFrom: string,
  dateTo: string,
): Promise<RubricEvent[]> {
  const events: RubricEvent[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const body = await postRubric("getUnifiedSearch", {
      firstCall: page === 0,
      sortType: "date",
      desiredType: "events",
      limit: PAGE_SIZE,
      offset,
      sortDirection: "asc",
      searchQuery: "",
      eventsPeriodFilter: "All",
      currentUrl: `${FRONTEND_BASE}/search?type=events&country=AU&state=New%20South%20Wales&universityid=${UNIVERSITY_ID}`,
      countryCode: "AU",
      state: "New South Wales",
      selectedUniversityId: UNIVERSITY_ID,
    });

    const batch = (body.results as Record<string, unknown>[]) ?? [];
    const total = (body.totalItemCount as number) ?? 0;

    if (!batch.length) break;

    let reachedEnd = false;

    for (const item of batch) {
      const sortindex = Number(item.sortindex ?? 0);
      if (!sortindex) continue;

      const dt = new Date(sortindex * 1000);
      const dateStr = toSydneyDateStr(dt);

      // API is sorted ascending — once we pass dateTo we can stop paginating
      if (dateStr > dateTo) {
        reachedEnd = true;
        break;
      }

      // Skip events before our window
      if (dateStr < dateFrom) continue;

      const eid = extractEventId(String(item.destination ?? ""));

      events.push({
        id: eid || `${sortindex}`,
        title: String(item.title ?? "").trim(),
        society: String(item.societyname ?? "").trim(),
        category: String(item.subtitle ?? "").trim(),
        dateStr,
        timeStr: toSydneyTimeStr(dt),
        isoDateTime: dt.toISOString(),
        url: eid
          ? `${FRONTEND_BASE}/?eid=${eid}`
          : `${FRONTEND_BASE}/search?type=events&universityid=${UNIVERSITY_ID}`,
        info: String(item.info ?? "").trim(),
      });
    }

    if (reachedEnd || events.length >= total || batch.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return events;
}
