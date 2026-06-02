import { z } from "zod";
import {
  FOOD_CATEGORIES,
  FOOD_CONDITIONS,
  PERISHABILITY_OPTIONS,
  ALLERGENS,
  DIETARY_TAGS,
} from "@/lib/constants";

export const listingSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(80, "Title must be 80 characters or fewer"),
    description: z
      .string()
      .max(500, "Description must be 500 characters or fewer")
      .optional(),
    food_category: z.enum(FOOD_CATEGORIES, {
      message: "Please select a food category",
    }),
    food_condition: z.enum(FOOD_CONDITIONS, {
      message: "Please select the food condition",
    }),
    quantity: z.coerce
      .number({ message: "Quantity is required" })
      .int("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1"),
    photo_url: z
      .union([z.string().url("Must be a valid URL"), z.literal("")])
      .optional(),
    pickup_location: z
      .string()
      .min(5, "Location must be at least 5 characters")
      .max(200, "Location must be 200 characters or fewer"),
    perishability: z.enum(PERISHABILITY_OPTIONS, {
      message: "Please select a perishability option",
    }),
    expires_at: z.string().optional(),
    served_at: z.string().optional(),
    allergens: z.array(z.enum(ALLERGENS)).optional().default([]),
    dietary_tags: z.array(z.enum(DIETARY_TAGS)).optional().default([]),
    contact_email: z
      .string()
      .min(1, "Email is required")
      .email("Must be a valid email address"),
    contact_phone: z.string().optional(),
    notes: z
      .string()
      .max(300, "Notes must be 300 characters or fewer")
      .optional(),
    safety_confirmed: z.boolean().refine((val) => val === true, {
      message: "You must confirm food safety before posting",
    }),
  })
  .refine(
    (data) =>
      data.perishability !== ">=30 mins" ||
      (data.expires_at && data.expires_at.length > 0),
    {
      message: "Expiry time is required for items lasting 30+ minutes",
      path: ["expires_at"],
    },
  );

export type ListingFormValues = z.infer<typeof listingSchema>;
