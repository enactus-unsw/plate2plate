# CLAUDE.md — FoodCompass

## Session Start — Read This First

Before writing any frontend code, component, or page:

1. **Re-read the Design System section** in this file — colour tokens, type scale, surface depth system, and anti-generic guardrails
2. **Check `brand_assets/`** if it exists — use any logos, colour guides, or imagery found there; never replace real assets with placeholders
3. **Apply the design token CSS variables** from `globals.css` — do not hardcode hex values in components
4. **Confirm the surface plane** of whatever you're building (base / elevated / floating) before writing any background or shadow style

**FoodCompass** is a real-time UNSW campus food rescue platform built by Enactus UNSW.
It redistributes untouched surplus food from university events to students before it becomes waste.

- **No user authentication** — zero-friction, high-trust model
- **Donors** (societies, Arc, clubs) post food listings anonymously; receive a secret UUID management link
- **Students** browse live listings and claim food with just name + email
- **Fully automated lifecycle** — expiry timers, claim revocation, soft deletes, feedback emails

---

## Tech Stack

| Layer           | Choice                                   |
| --------------- | ---------------------------------------- |
| Framework       | Next.js 14+ (App Router, TypeScript)     |
| Styling         | Tailwind CSS + shadcn/ui                 |
| Database        | Supabase (PostgreSQL)                    |
| Background jobs | Supabase pg_cron or Vercel Cron Jobs     |
| Email           | Brevo (transactional email via REST API) |
| Deployment      | Vercel                                   |
| Validation      | Zod                                      |
| Forms           | React Hook Form + Zod resolver           |

---

## Folder Structure

```
FoodCompass/
├── app/
│   ├── (marketing)/          # Landing/homepage group
│   │   └── page.tsx
│   ├── collect/              # Student feed — browse & claim listings
│   │   ├── page.tsx
│   │   └── [id]/             # Individual listing detail + claim form
│   │       └── page.tsx
│   ├── redistribute/         # Donor flow — create a food listing
│   │   └── page.tsx
│   ├── manage/
│   │   └── [token]/          # Donor management page (edit/close listing)
│   │       └── page.tsx
│   ├── api/
│   │   └── cron/             # Cron job endpoints (ETA check, feedback trigger)
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn/ui primitives (untouched, auto-generated)
│   ├── listings/             # ListingCard, ListingFeed, ClaimForm, ExpiryTimer, ManageListingCard
│   ├── forms/                # DonorForm, FeedbackForm
│   ├── layout/               # Navbar, Footer, PageWrapper
│   └── shared/               # Badge, CountdownTimer, AllergenTag, DietaryTag, EmptyState
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client (anon key)
│   │   └── server.ts         # Server client (service role key — mutations only)
│   ├── actions/              # Next.js Server Actions
│   │   ├── listings.ts       # createListing, updateListing, closeListing
│   │   └── claims.ts         # claimListing, revokeClaim, completeClaim
│   ├── validations/          # Zod schemas
│   │   ├── listing.schema.ts
│   │   └── claim.schema.ts
│   ├── utils/
│   │   ├── time.ts           # ETA constraint logic, expiry helpers
│   │   └── tokens.ts         # UUID generation for management tokens
│   └── constants.ts          # Allergen list, dietary tags, food categories
├── hooks/
│   ├── use-claimed-listings.ts  # LocalStorage tracking of claimed item IDs
│   └── use-countdown.ts         # Countdown timer hook
├── types/
│   └── index.ts              # Shared TypeScript interfaces (Listing, Claim, etc.)
└── public/
    └── og-image.png
```

---

## Architecture Principles

### No Authentication

- **Never** use Supabase Auth or any login system
- All DB mutations go through **Next.js Server Actions** using the `SUPABASE_SERVICE_ROLE_KEY`
- Public reads (listing feed) use the anon key with RLS set to SELECT only
- Donor identity = their UUID management token (generated on listing creation)

### Server Actions Over API Routes

- Prefer `'use server'` Server Actions for all mutations (create listing, claim, close listing)
- Reserve `/api/` routes only for cron job webhooks and external triggers (e.g. Brevo webhook)

### Data Immutability — Soft Deletes Only

- **Never hard delete** a listing or claim
- Expired/removed listings: `status = 'unavailable'`
- Revoked claims: `claim_status = 'revoked'`
- This preserves data for analytics and the feedback loop

### Real-Time

- Use Supabase Realtime subscriptions on the collect page to push listing updates (new listings, quantity changes, expirations) to connected clients without requiring a page refresh

### Local Storage for Student State

- Students have no account; use `localStorage` to track `listing_id`s they've claimed on the current device
- Key: `p2p_claimed_listings` → JSON array of listing IDs
- This drives UI state only ("You have claimed this" badge) — never used for security decisions

---

## Database Schema

```sql
-- Enums
CREATE TYPE perishability_type AS ENUM ('<30 mins', '>=30 mins');
CREATE TYPE listing_status AS ENUM ('available', 'held', 'unavailable');
CREATE TYPE claim_status AS ENUM ('active', 'completed', 'revoked');
CREATE TYPE food_condition AS ENUM ('sealed', 'packaged', 'untouched_catering', 'refrigerated', 'hot_food');

-- Listings
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  management_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  food_category   TEXT NOT NULL,
  food_condition  food_condition NOT NULL,
  quantity        INTEGER NOT NULL,
  quantity_remaining INTEGER NOT NULL,
  photo_url       TEXT,
  pickup_location TEXT NOT NULL,
  allergens       TEXT[] DEFAULT '{}',
  dietary_tags    TEXT[] DEFAULT '{}',
  notes           TEXT,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,
  zid             TEXT NOT NULL,
  perishability   perishability_type NOT NULL,
  status          listing_status NOT NULL DEFAULT 'available',
  expires_at      TIMESTAMPTZ NOT NULL,
  served_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claims
CREATE TABLE claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES listings(id),
  student_name    TEXT NOT NULL,
  student_email   TEXT NOT NULL,
  zid             TEXT NOT NULL,
  student_eta     TIMESTAMPTZ NOT NULL,
  claim_status    claim_status NOT NULL DEFAULT 'active',
  claimed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  feedback_sent   BOOLEAN NOT NULL DEFAULT false
);

-- Feedback
CREATE TABLE feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id        UUID NOT NULL REFERENCES claims(id),
  food_rating     INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  pickup_ease     INTEGER CHECK (pickup_ease BETWEEN 1 AND 5),
  comments        TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Business Logic

### Perishability & ETA Constraints

- `<30 mins` → listing expires 30 min after `created_at`; student ETA max is 30 min from now
- `>=30 mins` → listing expires when donor sets `expires_at`; student ETA can go up to that time
- ETA dropdown must be dynamically generated from these constraints on the client

### Claim State Machine (run via cron every 2 min)

```
HELD item evaluation:
  IF now() > student_eta + 10min AND listing.expires_at NOT reached
    → claim_status = 'revoked', listing.status = 'available'
  IF listing.expires_at reached
    → listing.status = 'unavailable'

UNCLAIMED available listing:
  IF now() > listing.expires_at
    → listing.status = 'unavailable'
```

### Feedback Loop (run via cron every hour)

```
  Find all claims WHERE:
    claim_status = 'completed'
    AND completed_at <= now() - interval '12 hours'
    AND feedback_sent = false
  → Send feedback email via Brevo
  → Set feedback_sent = true
```

---

## Design System

### Design Direction

**Warm earthy base + clean modern structure.** The visual language sits at the intersection of climate-tech SaaS and organic sustainability — not rustic or hand-crafted, not cold and corporate. Think: generous negative space, sharp typographic hierarchy, a warm neutral foundation, and deliberate use of green as the single dominant brand colour. Amber is reserved strictly for urgency signals (timers, warnings). The overall feel should be premium and intentional, like a well-funded startup that cares about the environment.

### Colour Palette

```css
/* Base */
--color-bg: #f9f8f5; /* warm off-white — main background */
--color-surface: #ffffff; /* pure white — cards, modals */
--color-surface-warm: #f4f0e8; /* cream — secondary surfaces, section backgrounds */
--color-border: #e5ddd0; /* warm greige border */
--color-border-subtle: #ede8e0; /* lighter border for card dividers */

/* Text */
--color-text: #18160f; /* near-black warm — primary text */
--color-text-secondary: #6b6254; /* warm muted — supporting text, labels */
--color-text-disabled: #ada396; /* disabled state text */

/* Brand */
--color-primary: #2e5d3e; /* deep forest green — primary actions, brand */
--color-primary-hover: #245031; /* darker green for hover */
--color-primary-light: #ebf2ec; /* green tint — hover backgrounds, badges */
--color-primary-mid: #4a7c5c; /* mid green — illustrations, accents */

/* Urgency / Accent */
--color-amber: #b87333; /* warm amber — timers under 10 min, warnings */
--color-amber-light: #fbf0e0; /* amber tint — warning badge backgrounds */
--color-red: #b83232; /* red — expired, danger states */
--color-red-light: #fbeaea; /* red tint — error badge backgrounds */

/* Utility */
--color-success: #2e5d3e; /* same as primary */
--color-overlay: rgba(24, 22, 15, 0.4); /* modal/drawer backdrop */
```

### Typography

- **Display / Hero headings:** `Fraunces` (Google Fonts, variable) — organic serif with warmth and character; used for H1, H2, and hero copy only
- **UI / Body / Everything else:** `DM Sans` (Google Fonts) — clean, modern, highly legible; used for all UI labels, body text, buttons, inputs
- **Monospace (timers, tokens):** `DM Mono` — for countdown timers and management token URLs

```css
/* Type scale — follow this, no ad-hoc sizes */
--text-xs: 0.75rem; /* 12px — labels, tags */
--text-sm: 0.875rem; /* 14px — supporting text, captions */
--text-base: 1rem; /* 16px — body, form fields */
--text-lg: 1.125rem; /* 18px — card titles, subheadings */
--text-xl: 1.25rem; /* 20px — section intros */
--text-2xl: 1.5rem; /* 24px — page headings */
--text-3xl: 1.875rem; /* 30px — section headings */
--text-4xl: 2.25rem; /* 36px — hero subheading */
--text-5xl: 3rem; /* 48px — hero headline (Fraunces) */
--text-6xl: 3.75rem; /* 60px — hero headline large breakpoint */
```

### Component Conventions

- All shadcn/ui components installed via CLI, kept in `components/ui/` — **never edit directly**
- Extend shadcn components via `className` or wrapper composition — do not fork them
- Animations: subtle fade-up on mount (16px translate, 200ms ease-out); use `tailwind-animate` classes
- Countdown timer colour states: `text-primary` (green, > 10 min) → `text-amber` (amber, ≤ 10 min) → `text-red` (red, ≤ 3 min)
- Cards: white surface, `border border-[--color-border]`, `rounded-xl`, subtle `shadow-sm`, `hover:shadow-md` transition
- Buttons: Primary = deep green fill, white text. Secondary = warm surface + border. Ghost = no border, text only.
- Form inputs: white background, warm border, green focus ring (`ring-[--color-primary]`)
- Empty states: centred, muted icon, short copy, optional CTA — never raw blank space
- Loading states: skeleton loaders that match the shape of the content (not spinners)

### Spacing System

```
/* Follow Tailwind scale strictly — no arbitrary values */
Section vertical padding:   py-16 md:py-24 lg:py-32
Section horizontal padding: px-4 sm:px-6 lg:px-8 (via layout wrapper)
Card padding:               p-5 md:p-6
Card gap in grid:           gap-4 md:gap-5
Form field gap:             space-y-4 md:space-y-5
Stack of sections:          space-y-24 md:space-y-32
```

### Layout

- Max content width: `max-w-6xl mx-auto` (1152px) for most pages
- Collect feed grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Donor form: single column, `max-w-2xl mx-auto`
- Navbar: sticky, blurred backdrop (`backdrop-blur-md`), warm border bottom
- No full-bleed dark sections — warmth comes from `--color-surface-warm` section backgrounds, not dark mode inversions

---

### Surface Depth System

Every UI surface sits on one of three z-planes. Never put two adjacent elements on the same plane — contrast creates hierarchy.

```
Base      →  bg: #F9F8F5   (page background — nothing interactive lives here)
Elevated  →  bg: #FFFFFF   (cards, form panels, navbar)
Floating  →  bg: #FFFFFF   (modals, dropdowns, tooltips — add shadow + backdrop-blur)
```

Shadow scale (colour-tinted, never flat grey):

```css
/* Elevated — cards at rest */
box-shadow:
  0 1px 3px rgba(46, 93, 62, 0.06),
  0 4px 12px rgba(46, 93, 62, 0.08);

/* Elevated hover — card hover state */
box-shadow:
  0 4px 8px rgba(46, 93, 62, 0.08),
  0 12px 28px rgba(46, 93, 62, 0.12);

/* Floating — modals, dropdowns */
box-shadow:
  0 8px 24px rgba(24, 22, 15, 0.12),
  0 32px 64px rgba(24, 22, 15, 0.1);
```

Apply these via a utility class in `globals.css` — never use raw Tailwind `shadow-md`:

```css
.shadow-card {
  box-shadow:
    0 1px 3px rgba(46, 93, 62, 0.06),
    0 4px 12px rgba(46, 93, 62, 0.08);
}
.shadow-card-hover {
  box-shadow:
    0 4px 8px rgba(46, 93, 62, 0.08),
    0 12px 28px rgba(46, 93, 62, 0.12);
}
.shadow-float {
  box-shadow:
    0 8px 24px rgba(24, 22, 15, 0.12),
    0 32px 64px rgba(24, 22, 15, 0.1);
}
```

---

### Anti-Generic Guardrails

**Colours**

- Never use default Tailwind palette colours (indigo-500, blue-600, purple-\*, etc.)
- All colours come from the CSS custom properties defined above
- Derive tints/shades from `--color-primary` — do not invent new colours mid-build

**Typography**

- Large headings (≥ 3xl): `letter-spacing: -0.03em` (tight tracking — add to `globals.css` heading class)
- Body text: `line-height: 1.7` (generous, readable)
- Never use the same font for headings and body — Fraunces for display, DM Sans for UI
- Never set font sizes with arbitrary values like `text-[17px]` — use the defined type scale

**Shadows**

- Never use flat `shadow-md` or `shadow-lg` directly
- Use `.shadow-card`, `.shadow-card-hover`, `.shadow-float` defined in `globals.css`
- Shadows use green-tinted rgba on elevated surfaces, neutral dark on floating surfaces

**Gradients & Texture**

- Hero sections: subtle layered radial gradient (soft green glow, low opacity) behind content
- Add grain/texture overlay via SVG noise filter at ~3% opacity on hero for depth
- Never use purple, indigo, or blue gradients anywhere

**Animations**

- Only animate `transform` and `opacity` — never `transition-all`
- Use spring-style easing for interactive elements: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Standard ease for page/section transitions: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- Entry animations: fade up — `translateY(16px) → 0`, `opacity 0 → 1`, 240ms
- Keep all animations under 400ms total — never slow or theatrical

**Interactive States — No Exceptions**
Every clickable/interactive element must define all three:

- `hover:` — visual feedback (colour shift, shadow lift, scale)
- `focus-visible:` — `ring-2 ring-[--color-primary] ring-offset-2`
- `active:` — `active:scale-[0.98]` on buttons and cards

**Images**

- Food listing photos: always wrap in a fixed aspect ratio container with `overflow-hidden rounded-lg`
- Apply bottom gradient overlay: `absolute inset-0 bg-gradient-to-t from-black/30 to-transparent`
- Never render a bare `<img>` without a defined aspect ratio container

**Depth & Layering**

- Surfaces must sit on distinct planes (base → elevated → floating)
- Use `backdrop-blur-md` on navbar and modals to reinforce the floating plane visually
- Cards must feel elevated — use `.shadow-card` and white background against the warm base

---

### Hard Rules — Non-Negotiable

- **Never** `transition-all` — always specify the property (`transition-shadow`, `transition-transform`, etc.)
- **Never** use default Tailwind blue/indigo/purple as any brand colour
- **Never** use flat unstyled `shadow-md` without colour tinting
- **Never** use the same font for heading and body
- **Never** use arbitrary font sizes like `text-[17px]` — follow the type scale
- **Never** use a spinner for loading states — always skeleton loaders shaped like the content
- **Never** leave empty UI states blank — always include an `<EmptyState>` component with copy

---

## Code Quality Rules

### General

- TypeScript strict mode — no `any`, no type assertions without justification
- All user input validated with Zod before hitting the DB
- Error boundaries around real-time components
- Loading skeletons for all async data (no raw spinners)

### Naming

- Components: `PascalCase` — `ListingCard`, `ClaimModal`, `ExpiryTimer`
- Server Actions: `camelCase` verb-noun — `createListing`, `claimListing`
- Hooks: `useXxx` — `useClaimedListings`, `useCountdown`
- DB columns: `snake_case`
- Zod schemas: `xxxSchema` — `listingSchema`, `claimSchema`

### Component Rules

- One component per file
- No file exceeds ~200 lines — split if growing beyond that
- Shared display components go in `components/shared/`
- Never put business logic inside JSX — extract to hooks or utils
- Server Components by default; add `'use client'` only when needed (interactivity, hooks, localStorage)

### What to Avoid

- No `console.log` left in production code
- No inline styles (use Tailwind classes only)
- No hardcoded strings for UI copy — keep in a `constants.ts` or co-located `copy.ts` if a page has a lot
- No direct Supabase client calls from Client Components for mutations — always go through Server Actions
- No `useEffect` for data fetching — use Server Components or React Query if needed

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never exposed to client
BREVO_API_KEY=                   # server-only
CRON_SECRET=                     # secret header for cron job routes
NEXT_PUBLIC_APP_URL=             # e.g. https://FoodCompass.vercel.app
```

---

## Key Decisions & Rationale

| Decision                         | Rationale                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| No auth                          | Maximize adoption; UNSW trust environment                                                               |
| UUID management token            | Gives donors edit access without an account                                                             |
| Soft deletes only                | Preserves data for analytics + feedback loop                                                            |
| Server Actions for mutations     | Keeps service role key off the client                                                                   |
| LocalStorage for claim tracking  | Avoids cookie consent complexity; UI-only state                                                         |
| Supabase Realtime                | Push updates without polling; better UX on the collect feed                                             |
| shadcn/ui                        | Accessible, unstyled Radix primitives — full design control, no bloat, consistent patterns              |
| Fraunces + DM Sans + DM Mono     | Warm/organic (Fraunces) + clean/modern (DM Sans) — matches the hybrid design direction                  |
| Warm earthy + clean modern       | Approachable and sustainability-forward without feeling rustic; premium without being cold              |
| White cards on warm off-white bg | Creates visual depth and hierarchy without dark/light mode complexity                                   |
| Green as sole brand colour       | Single dominant accent → more memorable and cohesive than multi-colour; amber reserved for urgency only |

---

## Out of Scope (MVP)

- User accounts / authentication
- "Current free food events" web scraping from Arc/UNSW
- Push notifications (architecture can be noted but not implemented)
- Admin dashboard
- Society verification flow
- Image uploads (use URL input for MVP; Supabase Storage can be added later)
- Impact stats on homepage (DB-computed — placeholder values for MVP, wire up later)
