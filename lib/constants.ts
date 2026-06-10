export const ALLERGENS = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Peanuts",
  "Tree Nuts",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Lupin",
  "Sulphites",
  "Mustard",
  "Celery",
  "Molluscs",
] as const;

export type Allergen = (typeof ALLERGENS)[number];

// Shown by default in the donor form; the rest sit behind "Show all".
export const COMMON_ALLERGENS = ["Gluten", "Dairy", "Tree Nuts"] as const;

export const DIETARY_TAGS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
] as const;

export type DietaryTag = (typeof DIETARY_TAGS)[number];

// Shown by default in the donor form; the rest sit behind "Show all".
export const COMMON_DIETARY_TAGS = ["Vegetarian", "Vegan", "Halal"] as const;

export const FOOD_CATEGORIES = [
  "Hot Meals",
  "Cold Meals",
  "Sandwiches & Wraps",
  "Pizza",
  "Sushi",
  "Salads",
  "Snacks",
  "Baked Goods",
  "Fruit",
  "Drinks",
  "Desserts",
  "Mixed/Platters",
  "Other",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const FOOD_CONDITIONS = [
  "sealed",
  "packaged",
  "untouched_catering",
  "refrigerated",
  "hot_food",
] as const;

export type FoodCondition = (typeof FOOD_CONDITIONS)[number];

export const FOOD_CONDITION_LABELS: Record<FoodCondition, string> = {
  sealed: "Sealed",
  packaged: "Packaged",
  untouched_catering: "Untouched Catering",
  refrigerated: "Refrigerated",
  hot_food: "Hot Food",
};

export const PERISHABILITY_OPTIONS = ["<30 mins", ">=30 mins"] as const;

export type Perishability = (typeof PERISHABILITY_OPTIONS)[number];

export const LOCAL_STORAGE_KEY = "p2p_claimed_listings";
