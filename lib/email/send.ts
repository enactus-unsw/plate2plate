import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return _resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Email send failed: RESEND_API_KEY is not set");
    return { error: "Email configuration missing" };
  }

  try {
    const { error } = await getResend().emails.send({
      from: "FoodCompass <noreply@food-compass.org>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send failed:", error);
      return { error: "Failed to send email" };
    }

    return {};
  } catch (err) {
    console.error("Email send failed:", err);
    return { error: "Failed to send email" };
  }
}
