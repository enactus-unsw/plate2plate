-- Add a distinct "collected" value to the listing_status enum.
--
-- Until now, a successfully collected listing was flipped to "unavailable" — the
-- same status as an expired or manually-closed listing — so the database could not
-- tell rescued food apart from wasted food. This adds a first-class "collected"
-- status set when the donor confirms a student has picked the food up.
--
-- NOTE: Postgres cannot add an enum value inside a transaction block, so this must
-- run as its own statement (Supabase migrations run each statement separately).

ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'collected';
