-- Donor-form simplification: mandatory photo uploads.
--
-- 1. Listings can now hold multiple photos. `photo_url` stays as the primary
--    image (first uploaded) so existing cards/emails keep working; `photo_urls`
--    holds the full set for future gallery rendering.
-- 2. A public Storage bucket holds the uploaded images. Uploads run server-side
--    with the service-role key (which bypasses RLS, consistent with the app's
--    no-auth model); reads are public so the images render on the feed.

alter table listings
  add column if not exists photo_urls text[] not null default '{}';

-- Public bucket for listing images (5 MB cap, common image types only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

-- Allow anyone to read the images (the bucket is public, but an explicit SELECT
-- policy keeps SDK-based reads working regardless of bucket-level settings).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read listing photos'
  ) then
    create policy "Public read listing photos"
      on storage.objects for select
      using (bucket_id = 'listing-photos');
  end if;
end $$;
