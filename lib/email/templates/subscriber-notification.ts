interface SubscriberEmailListing {
  id: string;
  title: string;
  description: string | null;
  food_category: string;
  quantity: number;
  pickup_location: string;
  expires_at: string;
}

export function buildSubscriberNotificationEmail(
  listing: SubscriberEmailListing,
): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://FoodCompass.vercel.app";

  const expiresAt = new Date(listing.expires_at);
  const expiresStr = expiresAt.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const descriptionHtml = listing.description
    ? `<tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Description</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;">${listing.description}</td>
                      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New food available on FoodCompass</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F8F5;">
    <tr>
      <td align="center" style="padding:0;">

        <!-- Header -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#2E5D3E;">
          <tr>
            <td align="center" style="padding:24px;">
              <div style="font-size:20px;font-weight:700;color:#FFFFFF;margin:0;">FoodCompass</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">Enactus UNSW</div>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:24px auto;background-color:#FFFFFF;border-radius:12px;border:1px solid #E5DDD0;">
          <tr>
            <td style="padding:40px;">

              <!-- Bell Icon -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:48px;height:48px;border-radius:50%;background-color:#EBF2EC;display:inline-block;line-height:48px;text-align:center;font-size:24px;color:#2E5D3E;">&#128276;</div>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="font-size:24px;color:#18160F;text-align:center;margin:16px 0 8px;font-weight:700;">Free food just dropped!</h1>
              <p style="font-size:15px;color:#6B6254;text-align:center;line-height:1.6;margin:0 0 24px;">A new listing has been posted on campus. Here's what's available:</p>

              <!-- Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F0E8;border-radius:8px;margin:24px 0;">
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Title</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;font-weight:600;">${listing.title}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Category</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;">${listing.food_category}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Quantity</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;">${listing.quantity} serving${listing.quantity === 1 ? "" : "s"}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Pickup location</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;">${listing.pickup_location}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Expires</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;font-weight:600;">${expiresStr}</td>
                      </tr>
                      ${descriptionHtml}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Urgency Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBF2EC;border-radius:8px;border-left:4px solid #2E5D3E;margin:24px 0;">
                <tr>
                  <td style="padding:16px;">
                    <div style="font-size:14px;font-weight:600;color:#18160F;margin-bottom:6px;">&#9888; Act fast</div>
                    <div style="font-size:13px;color:#6B6254;line-height:1.5;">This food is available on a first-come, first-served basis. Claim it before it's gone!</div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/collect/${listing.id}" style="background-color:#2E5D3E;color:#FFFFFF;padding:14px 28px;border-radius:8px;font-weight:600;text-decoration:none;display:inline-block;font-size:15px;">View &amp; Claim &rarr;</a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5DDD0;margin-top:32px;">
                <tr>
                  <td style="padding-top:24px;text-align:center;">
                    <p style="font-size:12px;color:#ADA396;margin:0;">FoodCompass &middot; Enactus UNSW &middot; Reducing food waste on campus</p>
                    <p style="font-size:12px;color:#ADA396;margin:8px 0 0;">You received this because you subscribed to food alerts. <a href="${appUrl}/unsubscribe" style="color:#ADA396;">Unsubscribe</a></p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
