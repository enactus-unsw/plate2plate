"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const emailSchema = z.email("Please enter a valid email address.");

export async function subscribeToNotifications(
  email: string,
): Promise<{ error?: string }> {
  const parsed = emailSchema.safeParse(email);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createServiceClient();

    const { error } = await supabase.from("subscribers").insert({
      email: parsed.data,
    });

    if (error) {
      if (error.code === "23505") {
        return { error: "You're already subscribed!" };
      }
      console.error("subscribeToNotifications DB error:", error);
      return { error: "Something went wrong. Please try again." };
    }

    return {};
  } catch (err) {
    console.error("subscribeToNotifications unexpected error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
