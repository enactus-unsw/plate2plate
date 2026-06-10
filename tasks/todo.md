# Feature: Simplify the donor form

Branch: `feature/simplify-donor-form`

Three changes to the "Post Surplus Food" form (`components/forms/DonorForm.tsx`):

1. **Dietary/allergens** → compact "show 3 + Show all + free-text 'other'" control (both allergens & dietary tags).
2. **Perishability** → remove the two `<30 mins` / `>=30 mins` buttons; single required "Food available until" datetime input. Derive the perishability bucket server-side from the chosen time (keeps ETA logic working, no extra schema).
3. **Photos** → mandatory upload (≥1) to Supabase Storage. Data layer supports multiple; primary `photo_url` = first image, all stored in new `photo_urls[]`.

## Plan

### DB / storage

- [ ] 1. Migration: `add column photo_urls text[] not null default '{}'` on listings
- [ ] 2. Same migration: create public `listing-photos` storage bucket (5MB, image mime types) + public-read policy

### Validation & types

- [ ] 3. `lib/constants.ts`: add `COMMON_ALLERGENS` / `COMMON_DIETARY_TAGS` (the 3 shown by default)
- [ ] 4. `lib/validations/listing.schema.ts`:
     - drop `perishability` field + its refine; make `expires_at` **required** + must be future
     - allergens/dietary → `z.array(z.string())` (allow custom free-text)
     - drop `photo_url`; photos validated separately (server enforces ≥1 url)
- [ ] 5. `types/index.ts`: add `photo_urls: string[]` to `Listing`

### Server actions (`lib/actions/listings.ts`)

- [ ] 6. New `uploadListingPhotos(formData)` — uploads files to bucket via service role, returns public URLs (validates type/size/count)
- [ ] 7. `createListing(values, photoUrls)` — require ≥1 url; derive `perishability` from `expires_at`; set `photo_url = photoUrls[0]`, `photo_urls = photoUrls`

### UI

- [ ] 8. New `components/forms/TagMultiSelect.tsx` — show 3 + "Show all" toggle + comma-sep "add other" box
- [ ] 9. New `components/forms/PhotoUpload.tsx` — multi-file picker, image previews, remove, ≥1 required
- [ ] 10. `DonorForm.tsx`: wire the three new controls; upload on submit then `createListing`; remove perishability buttons & photo URL input

### Verify

- [x] 11. `tsc` + `eslint` clean on changed files; prettier
- [x] 12. Smoke-tested upload + create end-to-end against a local Supabase (schema created for the
      test, then torn down). Verified the listing row, derived perishability, 2 uploaded photos
      (incl. a 4.9 MB file), and public serving.

## Review

**What changed (donor form simplification).**

- **Dietary/allergens** — both sections now use a new `TagMultiSelect`: 3 common chips shown,
  a "Show all" toggle reveals the rest, and a comma-separated text box adds anything not listed.
  Schema relaxed from `enum` to `string[]` so custom entries are allowed.
- **Perishability** — the two `<30 mins` / `>=30 mins` buttons are gone. A single required
  "Food available until" datetime input drives everything; the perishability bucket is **derived
  server-side** in `createListing` from how soon the food expires, so the claim-page ETA
  granularity keeps working with no schema change.
- **Photos** — now mandatory. New `PhotoUpload` (multi-file, image previews, remove, cover badge,
  max 4). Photos upload **directly from the browser to Supabase Storage via signed upload URLs**
  (`createPhotoUploadTargets` mints them server-side; the client `uploadToSignedUrl`s each file).
  `createListing` requires ≥1 URL, stores all in the new `photo_urls[]` column, and keeps
  `photo_url` = first image so existing cards/emails are untouched.

**Bug found & fixed during the smoke test.** The first implementation pushed the photo bytes
*through* a Server Action (`uploadListingPhotos(FormData)`). That **400'd** on a ~5 MB upload —
Next.js Server Actions cap the body at 1 MB by default, and Vercel caps function request bodies at
~4.5 MB, so it would have failed in production too. Reworked to **direct-to-Storage signed-URL
uploads** so the bytes never traverse the Server Action — the 4.9 MB photo then uploaded fine. Also
added `next.config.ts` `images.remotePatterns` for `*.supabase.co` + local Supabase so `next/image`
can render the stored photos.

**Verification (local Supabase, schema created for the test then torn down):**
- Filled the form in a real browser, uploaded 2 photos, submitted → success screen.
- DB row correct: category/condition/quantity/zid, `allergens={Gluten,Dairy}`,
  `dietary_tags={Vegetarian,Halal}`, **`perishability` derived as `>=30 mins`** from the expiry.
- Storage held both objects (437 KB + **4.9 MB**); `photo_url` = the cover (first) image; image
  served publicly (HTTP 200). Listing rendered on `/collect`.
- `tsc` + `eslint` clean; prettier run. (Local `next/image` shows the photo as broken because Next
  blocks optimizing **private-IP** upstreams — a localhost-only artifact; production `*.supabase.co`
  is unaffected.)

**⚠️ Manual step before deploying:** apply
`supabase/migrations/20260610000000_listing_photos_storage.sql` (adds `photo_urls` column + the
`listing-photos` bucket + public-read policy), plus the earlier `collected`-status migration if not
already applied.
