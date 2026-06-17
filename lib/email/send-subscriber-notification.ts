import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { buildSubscriberNotificationEmail } from "@/lib/email/templates/subscriber-notification";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return _resend;
}

interface ListingInfo {
  id: string;
  title: string;
  description: string | null;
  food_category: string;
  quantity: number;
  pickup_location: string;
  expires_at: string;
}

export async function notifySubscribers(listing: ListingInfo): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Subscriber notification skipped: RESEND_API_KEY is not set");
    return;
  }

  try {
    const supabase = await createServiceClient();

    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("email");

    if (error) {
      console.error("notifySubscribers fetch error:", error);
      return;
    }

    if (!subscribers || subscribers.length === 0) {
      return;
    }

    const html = buildSubscriberNotificationEmail(listing);
    const fromEmail = "noreply@food-compass.org";
    const fromName = "FoodCompass";

    await getResend().batch.send(
      subscribers.map((sub) => ({
        from: `${fromName} <${fromEmail}>`,
        to: [sub.email],
        subject: `New: ${listing.title} — free food on campus`,
        html,
      })),
    );

    console.log(
      `Notified ${subscribers.length} subscriber(s) about listing "${listing.title}"`,
    );
  } catch (err) {
    console.error("notifySubscribers unexpected error:", err);
  }
}
