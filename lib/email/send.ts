const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("Email send failed: BREVO_API_KEY is not set");
    return { error: "Email configuration missing" };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "FoodCompass", email: "ethan.richard@enactusunsw.org" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Email send failed:", response.status, body);
      return { error: "Failed to send email" };
    }

    return {};
  } catch (err) {
    console.error("Email send failed:", err);
    return { error: "Failed to send email" };
  }
}
