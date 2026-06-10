export type PerishabilityType = "<30 mins" | ">=30 mins";

export type ListingStatus = "available" | "held" | "collected" | "unavailable";

export type ClaimStatus = "active" | "completed" | "revoked";

export type FoodCondition =
  | "sealed"
  | "packaged"
  | "untouched_catering"
  | "refrigerated"
  | "hot_food";

export interface Listing {
  id: string;
  management_token: string;
  title: string;
  description: string | null;
  food_category: string;
  food_condition: FoodCondition;
  quantity: number;
  quantity_remaining: number;
  photo_url: string | null;
  photo_urls: string[];
  pickup_location: string;
  allergens: string[];
  dietary_tags: string[];
  notes: string | null;
  contact_email: string;
  contact_phone: string | null;
  zid: string;
  perishability: PerishabilityType;
  status: ListingStatus;
  expires_at: string;
  served_at: string | null;
  created_at: string;
}

export interface Claim {
  id: string;
  listing_id: string;
  student_name: string;
  student_email: string;
  zid: string;
  student_eta: string;
  claim_status: ClaimStatus;
  claimed_at: string;
  completed_at: string | null;
  feedback_sent: boolean;
}

export interface Feedback {
  id: string;
  claim_id: string;
  food_rating: number | null;
  pickup_ease: number | null;
  comments: string | null;
  submitted_at: string;
}
