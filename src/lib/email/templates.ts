import "server-only";

import type { ApplicationStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  reviewing: "Under review",
  interview: "Invited to interview",
  accepted: "Accepted",
  rejected: "Not moving forward",
};

const STATUS_BLURB: Record<ApplicationStatus, string> = {
  applied:
    "Your application has been received. The HR team will review it shortly.",
  reviewing:
    "Good news - your application is now being reviewed by the HR team.",
  interview:
    "Congratulations! You have been shortlisted for an interview. The HR team will reach out separately to schedule.",
  accepted:
    "Congratulations! We are excited to let you know your application was successful. The HR team will follow up with the next steps.",
  rejected:
    "Thank you for your interest. After careful consideration we will not be moving forward with your application this time. We wish you the best in your search.",
};

type StatusEmailInput = {
  candidateName: string;
  jobTitle: string;
  status: ApplicationStatus;
};

export function buildStatusEmail({
  candidateName,
  jobTitle,
  status,
}: StatusEmailInput) {
  const heading = STATUS_LABEL[status];
  const body = STATUS_BLURB[status];
  const subject = `${heading} - ${jobTitle} (SMARTHIRE)`;

  const text = [
    `Hi ${candidateName},`,
    "",
    body,
    "",
    `Role: ${jobTitle}`,
    `Status: ${heading}`,
    "",
    "- SMARTHIRE",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="font-family: Inter, Arial, sans-serif; background:#f8fafc; padding:24px; color:#0a0a0a;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:32px;">
      <p style="font-size:14px; color:#dc2626; letter-spacing:0.04em; text-transform:uppercase; font-weight:600; margin:0 0 8px;">SMARTHIRE</p>
      <h1 style="font-size:22px; margin:0 0 16px; font-weight:700;">${escapeHtml(heading)}</h1>
      <p style="margin:0 0 16px; line-height:1.6;">Hi ${escapeHtml(candidateName)},</p>
      <p style="margin:0 0 16px; line-height:1.6;">${escapeHtml(body)}</p>
      <p style="margin:0 0 4px; color:#64748b; font-size:14px;">Role</p>
      <p style="margin:0 0 16px; font-weight:600;">${escapeHtml(jobTitle)}</p>
      <p style="margin:24px 0 0; color:#64748b; font-size:13px;">- SMARTHIRE</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
