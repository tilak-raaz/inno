/**
 * Transactional email.
 *
 * Resend is used when configured — a plain HTTPS call, no SDK dependency. With
 * no provider configured the code is written to the server log instead, so
 * email sign-in is usable in development without signing up for anything. That
 * fallback is refused in production, because silently "sending" a login code to
 * nowhere is worse than a visible failure.
 */

type SendResult = { ok: true } | { ok: false; message: string };

const from = () => process.env.EMAIL_FROM?.trim() || "INNOVISION <onboarding@resend.dev>";

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error("[email] RESEND_API_KEY is not set; refusing to fake a send");
      return { ok: false, message: "Email delivery is not configured." };
    }
    console.info(
      `\n[email:dev] to=${params.to}\n[email:dev] ${params.subject}\n[email:dev] ${params.text}\n`,
    );
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from(),
        to: [params.to],
        subject: params.subject,
        text: params.text,
        ...(params.html ? { html: params.html } : {}),
      }),
    });

    if (!res.ok) {
      // Provider errors can quote the recipient address; keep them in the log.
      console.error("[email] send failed", res.status, await res.text().catch(() => ""));
      return { ok: false, message: "Could not send the email." };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] send threw", error);
    return { ok: false, message: "Could not send the email." };
  }
}

/** The reasons Better Auth asks us to send a code. */
export type OtpPurpose =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

/** The one-time code email, in the festival's voice. */
export function otpEmail(otp: string, purpose: OtpPurpose) {
  const heading =
    purpose === "sign-in"
      ? "Your sign-in code"
      : purpose === "forget-password"
        ? "Reset your password"
        : "Verify your email address";
  return {
    subject: `${otp} — ${heading} for INNOVISION 2026`,
    text: [
      `${heading} for INNOVISION 2026:`,
      "",
      otp,
      "",
      "The code expires in 5 minutes. If you did not request it, ignore this email.",
    ].join("\n"),
    html: `<!doctype html><html><body style="margin:0;background:#06030e;color:#e8e4f5;font-family:ui-sans-serif,system-ui,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#120a26;border:1px solid rgba(150,100,255,.24);border-radius:16px;padding:36px">
        <tr><td>
          <p style="margin:0;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#8b7fb0">Innovision 2026</p>
          <h1 style="margin:16px 0 0;font-size:22px;color:#ffffff">${heading}</h1>
          <p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:#c7bee2">Enter this code to continue:</p>
          <p style="margin:24px 0;font-size:34px;font-weight:700;letter-spacing:.22em;color:#ffffff">${otp}</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#8b7fb0">The code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  };
}
