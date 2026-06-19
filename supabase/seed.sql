-- Local demo seed data. Expiry times are relative to db reset time so the
-- collect feed always has live listings when developing locally.

INSERT INTO listings
  (title, description, food_category, food_condition, quantity, quantity_remaining,
   pickup_location, allergens, dietary_tags, notes, contact_email, contact_phone,
   zid, perishability, status, expires_at)
VALUES
  ('Leftover pizza from CSESoc BBQ', '12 boxes of untouched margherita and pepperoni pizza.',
   'Pizza', 'untouched_catering', 24, 18,
   'Quadrangle Building, Level 2 foyer', ARRAY['Gluten', 'Dairy'], ARRAY['vegetarian'],
   'Ask for the CSESoc volunteer in the green shirt.', 'csesoc@unsw.edu.au', '0400 111 222',
   'z5111111', '>=30 mins', 'available', now() + interval '3 hours'),

  ('Sushi platters — MedSoc seminar', 'Two full untouched sushi platters from our lunch seminar.',
   'Sushi', 'refrigerated', 16, 16,
   'Wallace Wurth Building, Room 113', ARRAY['Fish', 'Soy', 'Gluten'], ARRAY[]::text[],
   NULL, 'medsoc@unsw.edu.au', NULL,
   'z5222222', '>=30 mins', 'available', now() + interval '2 hours'),

  ('Hot curry + rice from EnviroSoc mixer', 'Vegan chickpea curry with rice, still hot in bain-marie trays.',
   'Hot Meals', 'hot_food', 30, 9,
   'Roundhouse, side entrance near the lawn', ARRAY[]::text[], ARRAY['vegan', 'vegetarian', 'halal', 'gluten-free'],
   'Bring your own container if you can!', 'envirosoc@unsw.edu.au', '0400 333 444',
   'z5333333', '<30 mins', 'available', now() + interval '28 minutes'),

  ('Sandwich platter — FinSoc networking night', 'Assorted halal chicken and falafel wraps, individually wrapped.',
   'Sandwiches', 'packaged', 20, 4,
   'UNSW Business School, Lounge Level 1', ARRAY['Gluten', 'Sesame'], ARRAY['halal'],
   NULL, 'finsoc@unsw.edu.au', NULL,
   'z5444444', '>=30 mins', 'available', now() + interval '90 minutes'),

  ('Fruit boxes + muffins from Arc stall', 'Sealed fruit boxes and blueberry muffins left over from the morning stall.',
   'Snacks & Baked Goods', 'sealed', 40, 33,
   'Arc Reception, Gate 5 on High St', ARRAY['Gluten', 'Eggs'], ARRAY['vegetarian'],
   'Available until the afternoon — come anytime.', 'arc@unsw.edu.au', '0400 555 666',
   'z5555555', '>=30 mins', 'available', now() + interval '4 hours');
