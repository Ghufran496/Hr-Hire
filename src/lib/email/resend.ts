import "server-only";

import { Resend } from "resend";

let cached: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new Resend(key);
  return cached;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not-configured"; message: string }
  | { ok: false; reason: "send-failed"; message: string };

const FROM_FALLBACK = "SMARTHIRE <onboarding@resend.dev>";

/**
 * Send a transactional email via Resend. Gracefully no-ops when
 * RESEND_API_KEY is missing - the calling action still completes.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    return {
      ok: false,
      reason: "not-configured",
      message: "RESEND_API_KEY is not set; skipping email.",
    };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? FROM_FALLBACK;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      return { ok: false, reason: "send-failed", message: error.message };
    }
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown send error";
    return { ok: false, reason: "send-failed", message };
  }
}
