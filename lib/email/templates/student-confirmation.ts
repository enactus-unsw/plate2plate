interface StudentEmailListing {
  id: string;
  title: string;
  food_category: string;
  pickup_location: string;
  expires_at: string;
  contact_email: string;
  contact_phone?: string | null;
}

interface StudentEmailClaim {
  student_name: string;
  student_eta: string;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return `${dateStr} at ${timeStr}`;
}

export function buildStudentConfirmationEmail(
  listing: StudentEmailListing,
  claim: StudentEmailClaim,
): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://FoodCompass.vercel.app";

  const contactSection = listing.contact_phone
    ? `<tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;vertical-align:top;">Email</td>
                        <td style="padding:4px 0;font-size:14px;"><a href="mailto:${listing.contact_email}" style="color:#2E5D3E;text-decoration:none;">${listing.contact_email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;vertical-align:top;">Phone</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;">${listing.contact_phone}</td>
                      </tr>`
    : `<tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;vertical-align:top;">Email</td>
                        <td style="padding:4px 0;font-size:14px;"><a href="mailto:${listing.contact_email}" style="color:#2E5D3E;text-decoration:none;">${listing.contact_email}</a></td>
                      </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've claimed food on FoodCompass</title>
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

              <!-- Checkmark -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:48px;height:48px;border-radius:50%;background-color:#EBF2EC;display:inline-block;line-height:48px;text-align:center;font-size:24px;color:#2E5D3E;">&#10003;</div>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="font-size:24px;color:#18160F;text-align:center;margin:16px 0 8px;font-weight:700;">You're confirmed!</h1>
              <p style="font-size:15px;color:#6B6254;text-align:center;line-height:1.6;margin:0 0 24px;">Hi ${claim.student_name}, your food is being held for you. Head to the pickup location before your ETA.</p>

              <!-- Pickup Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F0E8;border-radius:8px;margin:24px 0;">
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Food</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;font-weight:600;">${listing.title}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Category</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;">${listing.food_category}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Pickup location</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;">${listing.pickup_location}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#6B6254;width:120px;vertical-align:top;">Your ETA</td>
                        <td style="padding:4px 0;font-size:14px;color:#18160F;font-weight:600;">${formatDateTime(claim.student_eta)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Urgency Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBF2EC;border-radius:8px;border-left:4px solid #2E5D3E;margin:24px 0;">
                <tr>
                  <td style="padding:16px;">
                    <div style="font-size:14px;font-weight:600;color:#18160F;margin-bottom:6px;">&#128336; Please arrive by your ETA</div>
                    <div style="font-size:13px;color:#6B6254;line-height:1.5;">If you don't arrive within 10 minutes of your ETA, your claim will be released so another student can collect the food.</div>
                  </td>
                </tr>
              </table>

              <!-- Contact Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td>
                    <div style="font-size:15px;font-weight:600;color:#18160F;margin-bottom:12px;">Need to reach the donor?</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${contactSection}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/collect/${listing.id}" style="background-color:#2E5D3E;color:#FFFFFF;padding:14px 28px;border-radius:8px;font-weight:600;text-decoration:none;display:inline-block;font-size:15px;">View Your Claim &rarr;</a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5DDD0;margin-top:32px;">
                <tr>
                  <td style="padding-top:24px;text-align:center;">
                    <p style="font-size:12px;color:#ADA396;margin:0;">FoodCompass &middot; Enactus UNSW &middot; Reducing food waste on campus</p>
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
