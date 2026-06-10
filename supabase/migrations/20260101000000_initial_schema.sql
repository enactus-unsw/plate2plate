-- Base schema for Plate2Plate (mirrors the production schema documented in CLAUDE.md).

CREATE TYPE perishability_type AS ENUM ('<30 mins', '>=30 mins');
CREATE TYPE listing_status AS ENUM ('available', 'held', 'unavailable');
CREATE TYPE claim_status AS ENUM ('active', 'completed', 'revoked');
CREATE TYPE food_condition AS ENUM ('sealed', 'packaged', 'untouched_catering', 'refrigerated', 'hot_food');

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

CREATE TABLE feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id        UUID NOT NULL REFERENCES claims(id),
  food_rating     INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  pickup_ease     INTEGER CHECK (pickup_ease BETWEEN 1 AND 5),
  comments        TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public reads via anon key (feed), mutations go through the service role.
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read listings" ON listings FOR SELECT USING (true);
