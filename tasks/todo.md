# Chore: Food collection confirmation

Add a way for the donor (lister) to confirm food was collected — via a button in the
claim-notification email that links to their manage page — and persist a real `collected`
status (instead of reusing `unavailable`).

## Plan

- [x] 1. DB migration: add `collected` value to `listing_status` enum (`supabase/migrations/`)
- [x] 2. `types/index.ts`: add `"collected"` to `ListingStatus`
- [x] 3. `lib/actions/listings.ts`: new `markCollected(token)` action — completes active claim,
     sets `status = 'collected'` + `served_at = now()`
- [x] 4. `lib/actions/claims.ts`: block claims unless status is `available`/`held` (so `collected` is unclaimable)
- [x] 5. `components/listings/ManageListingCard.tsx`: call `markCollected`; show `collected` badge on reload; terminal state
- [x] 6. `hooks/use-realtime-listings.ts`: drop listing from feed when it becomes `collected`
- [x] 7. `src/app/(marketing)/page.tsx`: include `collected` in diverted-food impact stat
- [x] 8. `lib/email/templates/donor-claim-notification.ts`: add "Mark as Collected" CTA → manage page
- [x] 9. `lib/actions/claims.ts`: pass `management_token` → managementUrl into the claim-notification email
- [x] 10. Verify: type-check + lint clean on all changed files

## Review

**What changed.** The donor's claim-notification email now carries a green **"Mark as Collected"**
button that deep-links to their `/manage/<token>` page (chosen over a one-click email mutate so
email link-prefetchers can't accidentally trigger it). On that page the existing button now calls a
new `markCollected()` server action that, in one shot: completes any active claim
(`claim_status = 'completed'`), and sets the listing to a brand-new **`collected`** status with
`served_at = now()`.

**`collected` is now a first-class status** (previously collection just reused `unavailable`, making
rescued food indistinguishable from expired/closed). Wired through every touchpoint:

- Collect feed / detail page already filter to `available`/`held`, so collected drops off — no change needed.
- Realtime hook now removes a listing from the feed on any non-`available`/`held` update.
- `claimListing` now refuses anything that isn't `available`/`held` (so a collected item can't be re-claimed).
- Marketing "diverted food" stat now counts `collected` alongside `unavailable`.
- `ManageListingCard` shows the Collected badge + terminal (disabled) state after reload, not just in client memory.

**Cleanup.** Removed a now-dead active-claim query from the manage page and the unused `activeClaim`
prop, since `markCollected` resolves the claim by listing token server-side.

**Verification.** `tsc --noEmit` and `eslint` are clean on all changed files. (Pre-existing,
unrelated type errors live in `components/ui/bento-grid-showcase.tsx`, an auto-generated shadcn
component that CLAUDE.md forbids editing — untouched here.)

**⚠️ One manual step:** apply the migration in Supabase before deploying — Postgres can't add an enum
value at runtime. Run `supabase/migrations/20260604000000_add_collected_listing_status.sql`
(`ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'collected';`).
