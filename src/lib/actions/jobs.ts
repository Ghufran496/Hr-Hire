"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { jobSchema, type JobInput } from "@/lib/validation/job";
import type { JobRow } from "@/lib/supabase/types";

export type CreateJobResult =
  | { ok: true; job: JobRow }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createJobAction(
  input: JobInput,
): Promise<CreateJobResult> {
  await requireAdmin();

  const parse = jobSchema.safeParse(input);
  if (!parse.success) {
    return {
      ok: false,
      error: "Some fields are invalid.",
      fieldErrors: z.flattenError(parse.error).fieldErrors,
    };
  }
  const v = parse.data;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("jobs")
    .insert({
      title: v.title,
      short_description: v.short_description,
      description: v.description,
      requirements: v.requirements,
      location: v.location ? v.location : null,
      employment_type: v.employment_type ? v.employment_type : null,
    })
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, error: "Could not create the job." };
  }

  revalidatePath("/jobs");
  revalidatePath("/hr/jobs");
  revalidatePath("/");
  return { ok: true, job: data as JobRow };
}

export type UpdateJobResult =
  | { ok: true; job: JobRow }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const updateSchema = jobSchema.extend({ id: z.string().uuid() });

export async function updateJobAction(
  input: JobInput & { id: string },
): Promise<UpdateJobResult> {
  await requireAdmin();

  const parse = updateSchema.safeParse(input);
  if (!parse.success) {
    return {
      ok: false,
      error: "Some fields are invalid.",
      fieldErrors: z.flattenError(parse.error).fieldErrors,
    };
  }
  const v = parse.data;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("jobs")
    .update({
      title: v.title,
      short_description: v.short_description,
      description: v.description,
      requirements: v.requirements,
      location: v.location ? v.location : null,
      employment_type: v.employment_type ? v.employment_type : null,
    })
    .eq("id", v.id)
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, error: "Could not update the job." };
  }

  revalidatePath("/jobs");
  revalidatePath("/hr/jobs");
  revalidatePath(`/jobs/${v.id}`);
  revalidatePath("/");
  return { ok: true, job: data as JobRow };
}

const toggleSchema = z.object({
  jobId: z.string().uuid(),
  isOpen: z.boolean(),
});

export type ToggleJobResult =
  | { ok: true; isOpen: boolean }
  | { ok: false; error: string };

export async function toggleJobOpenAction(input: {
  jobId: string;
  isOpen: boolean;
}): Promise<ToggleJobResult> {
  await requireAdmin();

  const parse = toggleSchema.safeParse(input);
  if (!parse.success) {
    return { ok: false, error: "Invalid input." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("jobs")
    .update({ is_open: parse.data.isOpen })
    .eq("id", parse.data.jobId);
  if (error) {
    return { ok: false, error: "Could not update the job." };
  }

  revalidatePath("/jobs");
  revalidatePath("/hr/jobs");
  revalidatePath("/");
  return { ok: true, isOpen: parse.data.isOpen };
}

const deleteSchema = z.object({ jobId: z.string().uuid() });

export type DeleteJobResult = { ok: true } | { ok: false; error: string };

export async function deleteJobAction(input: {
  jobId: string;
}): Promise<DeleteJobResult> {
  await requireAdmin();

  const parse = deleteSchema.safeParse(input);
  if (!parse.success) {
    return { ok: false, error: "Invalid input." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("jobs")
    .delete()
    .eq("id", parse.data.jobId);
  if (error) {
    return { ok: false, error: "Could not delete the job." };
  }

  revalidatePath("/jobs");
  revalidatePath("/hr/jobs");
  revalidatePath("/");
  return { ok: true };
}
