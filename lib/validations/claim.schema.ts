import { z } from "zod";

export const claimFormSchema = z.object({
  student_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  student_email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  zid: z
    .string()
    .min(1, "zID is required")
    .regex(/^z\d{7}$/, "zID must be 'z' followed by 7 digits (e.g., z1234567)"),
  student_eta: z
    .string()
    .min(1, "Please select an arrival time")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Must be a valid ISO datetime",
    }),
  accepted_terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions before claiming food.",
  }),
});

export type ClaimFormValues = z.infer<typeof claimFormSchema>;

export const claimSchema = claimFormSchema.extend({
  listing_id: z.string().uuid("Invalid listing ID"),
});
