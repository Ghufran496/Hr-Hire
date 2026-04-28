"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { buildStatusEmail } from "@/lib/email/templates";
import {
  applicationFieldsSchema,
  MAX_CV_FILE_BYTES,
} from "@/lib/validation/application";
import type { ApplicationStatus } from "@/lib/supabase/types";

export type SubmitApplicationResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const STORAGE_BUCKET = "cvs";

/**
 * Public-facing application submit. Runs on the Node.js runtime so the
 * service-role Supabase client can be used. All fields are re-validated
 * server-side; the CV is type/size-checked again here regardless of the
 * client validation.
 */
export async function submitApplicationAction(
  formData: FormData,
): Promise<SubmitApplicationResult> {
  const jobId = formData.get("job_id");
  const cvEntry = formData.get("cv");

  if (typeof jobId !== "string" || jobId.length === 0) {
    return { ok: false, error: "Missing job." };
  }

  const fieldsParse = applicationFieldsSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    experience: formData.get("experience"),
    skills: formData.get("skills"),
  });
  if (!fieldsParse.success) {
    return {
      ok: false,
      error: "Some fields are invalid.",
      fieldErrors: z.flattenError(fieldsParse.error).fieldErrors,
    };
  }
  const fields = fieldsParse.data;

  if (!(cvEntry instanceof File) || cvEntry.size === 0) {
    return { ok: false, error: "Please attach your CV." };
  }
  if (cvEntry.size > MAX_CV_FILE_BYTES) {
    return { ok: false, error: "CV file is too large (max 5 MB)." };
  }
  if (cvEntry.type !== "application/pdf") {
    return { ok: false, error: "CV must be a PDF file." };
  }

  const admin = createAdminClient();
  const sessionUser = await getCurrentUser();

  // Confirm the job exists and is open before accepting the application.
  const { data: job, error: jobError } = await admin
    .from("jobs")
    .select("id, title, is_open")
    .eq("id", jobId)
    .maybeSingle();
  if (jobError) {
    return { ok: false, error: "Could not verify the job. Try again." };
  }
  if (!job || !job.is_open) {
    return {
      ok: false,
      error: "This role is no longer accepting applications.",
    };
  }

  // Upload the CV to a private path. crypto.randomUUID is available in the
  // Node 20+ runtime that Next.js server actions run on.
  const safeName = cvEntry.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${jobId}/${crypto.randomUUID()}-${safeName}`;

  const buffer = Buffer.from(await cvEntry.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (uploadError) {
    return { ok: false, error: "Could not upload your CV. Try again." };
  }

  const { data: inserted, error: insertError } = await admin
    .from("applications")
    .insert({
      job_id: jobId,
      user_id: sessionUser?.role === "candidate" ? sessionUser.id : null,
      full_name: fields.full_name,
      email: fields.email,
      phone: fields.phone,
      experience: fields.experience,
      skills: fields.skills,
      cv_path: path,
      // status intentionally omitted - DB default is 'applied'.
    })
    .select("id")
    .single();
  if (insertError || !inserted) {
    // Best-effort cleanup so we don't leave an orphaned PDF in storage.
    await admin.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false, error: "Could not save your application. Try again." };
  }

  // Fire-and-track confirmation email. Failure to send is logged but does
  // not break the user-facing flow - the application was saved.
  const { subject, text, html } = buildStatusEmail({
    candidateName: fields.full_name,
    jobTitle: job.title,
    status: "applied",
  });
  const emailResult = await sendEmail({
    to: fields.email,
    subject,
    text,
    html,
  });
  if (!emailResult.ok && emailResult.reason !== "not-configured") {
    console.warn(
      "[applications] confirmation email failed:",
      emailResult.message,
    );
  }

  revalidatePath("/hr/dashboard");
  return { ok: true, applicationId: inserted.id };
}

const APPLICATION_STATUSES = [
  "applied",
  "reviewing",
  "interview",
  "accepted",
  "rejected",
] as const satisfies readonly ApplicationStatus[];

const updateStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(APPLICATION_STATUSES),
});

export type UpdateStatusResult =
  | { ok: true; status: ApplicationStatus; emailed: boolean }
  | { ok: false; error: string };

export async function updateApplicationStatusAction(input: {
  applicationId: string;
  status: ApplicationStatus;
}): Promise<UpdateStatusResult> {
  await requireAdmin();

  const parse = updateStatusSchema.safeParse(input);
  if (!parse.success) {
    return { ok: false, error: "Invalid input." };
  }

  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("applications")
    .select("id, status, full_name, email, jobs:jobs(id, title)")
    .eq("id", parse.data.applicationId)
    .maybeSingle();
  if (existingError || !existing) {
    return { ok: false, error: "Application not found." };
  }

  if (existing.status === parse.data.status) {
    return { ok: true, status: existing.status, emailed: false };
  }

  const { error: updateError } = await admin
    .from("applications")
    .update({ status: parse.data.status })
    .eq("id", parse.data.applicationId);
  if (updateError) {
    return { ok: false, error: "Could not update status." };
  }

  let emailed = false;
  const job = Array.isArray(existing.jobs) ? existing.jobs[0] : existing.jobs;
  const jobTitle = job?.title ?? "your role";
  const { subject, text, html } = buildStatusEmail({
    candidateName: existing.full_name,
    jobTitle,
    status: parse.data.status,
  });
  const result = await sendEmail({
    to: existing.email,
    subject,
    text,
    html,
  });
  if (result.ok) {
    emailed = true;
  } else if (result.reason !== "not-configured") {
    console.warn("[applications] status email failed:", result.message);
  }

  revalidatePath("/hr/dashboard");
  revalidatePath(`/hr/applications/${parse.data.applicationId}`);
  return { ok: true, status: parse.data.status, emailed };
}

export type SignedCvUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Returns a short-lived signed URL for an application's CV.
 * Admin-only.
 */
export async function getSignedCvUrlAction(
  applicationId: string,
): Promise<SignedCvUrlResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: app, error } = await admin
    .from("applications")
    .select("cv_path")
    .eq("id", applicationId)
    .maybeSingle();
  if (error || !app) {
    return { ok: false, error: "Application not found." };
  }

  const { data: signed, error: signError } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(app.cv_path, 60 * 10); // 10 minutes
  if (signError || !signed) {
    return { ok: false, error: "Could not generate CV link." };
  }
  return { ok: true, url: signed.signedUrl };
}
