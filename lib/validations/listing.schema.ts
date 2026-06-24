import { z } from "zod";
import { FOOD_CATEGORIES, FOOD_CONDITIONS } from "@/lib/constants";

export const listingSchema = z.object({
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
  pickup_location: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(200, "Location must be 200 characters or fewer"),
  // Single required "food available until" time. The perishability bucket
  // (<30 mins / >=30 mins) is derived from this server-side.
  expires_at: z
    .string()
    .min(1, "Please set when the food is available until")
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Please enter a valid date and time",
    })
    .refine((val) => Date.parse(val) > Date.now(), {
      message: "The available-until time must be in the future",
    }),
  served_at: z.string().optional(),
  // Free-text allowed so donors can add allergens/tags not in the preset list.
  allergens: z.array(z.string().trim().min(1)).optional().default([]),
  dietary_tags: z.array(z.string().trim().min(1)).optional().default([]),
  contact_name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  contact_email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  contact_phone: z.string().optional(),
  zid: z
    .string()
    .min(1, "zID is required")
    .regex(/^z\d{7}$/, "zID must be 'z' followed by 7 digits (e.g., z1234567)"),
  notes: z
    .string()
    .max(300, "Notes must be 300 characters or fewer")
    .optional(),
  safety_confirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm food safety before posting",
  }),
});

export type ListingFormValues = z.infer<typeof listingSchema>;
