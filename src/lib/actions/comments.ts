"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CommentWithAuthorRow } from "@/lib/supabase/types";

const addCommentSchema = z.object({
  applicationId: z.string().uuid(),
  text: z
    .string()
    .min(1, "Note cannot be empty.")
    .max(4000, "Keep notes under 4000 characters."),
});

export type AddCommentResult =
  | { ok: true; comment: CommentWithAuthorRow }
  | { ok: false; error: string };

export async function addCommentAction(input: {
  applicationId: string;
  text: string;
}): Promise<AddCommentResult> {
  const admin = await requireAdmin();

  const parse = addCommentSchema.safeParse(input);
  if (!parse.success) {
    const message = parse.error.issues[0]?.message ?? "Invalid input.";
    return { ok: false, error: message };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      application_id: parse.data.applicationId,
      author_id: admin.id,
      text: parse.data.text,
    })
    .select("id, application_id, author_id, text, created_at")
    .single();
  if (error || !data) {
    return { ok: false, error: "Could not save your note." };
  }

  revalidatePath(`/hr/applications/${parse.data.applicationId}`);

  return {
    ok: true,
    comment: {
      ...data,
      author_name: admin.fullName ?? admin.email,
    },
  };
}

const updateCommentSchema = z.object({
  commentId: z.string().uuid(),
  text: z
    .string()
    .min(1, "Note cannot be empty.")
    .max(4000, "Keep notes under 4000 characters."),
});

export type UpdateCommentResult =
  | { ok: true; comment: CommentWithAuthorRow }
  | { ok: false; error: string };

export async function updateCommentAction(input: {
  commentId: string;
  text: string;
}): Promise<UpdateCommentResult> {
  const admin = await requireAdmin();

  const parse = updateCommentSchema.safeParse(input);
  if (!parse.success) {
    const message = parse.error.issues[0]?.message ?? "Invalid input.";
    return { ok: false, error: message };
  }

  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("comments")
    .select("id, application_id, author_id")
    .eq("id", parse.data.commentId)
    .maybeSingle();
  if (existingError || !existing) {
    return { ok: false, error: "Note not found." };
  }
  if (existing.author_id !== admin.id) {
    return { ok: false, error: "You can only edit your own notes." };
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ text: parse.data.text })
    .eq("id", parse.data.commentId)
    .select("id, application_id, author_id, text, created_at")
    .single();
  if (error || !data) {
    return { ok: false, error: "Could not update the note." };
  }

  revalidatePath(`/hr/applications/${existing.application_id}`);

  return {
    ok: true,
    comment: {
      ...data,
      author_name: admin.fullName ?? admin.email,
    },
  };
}

const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
});

export type DeleteCommentResult =
  | { ok: true; commentId: string }
  | { ok: false; error: string };

export async function deleteCommentAction(input: {
  commentId: string;
}): Promise<DeleteCommentResult> {
  const admin = await requireAdmin();

  const parse = deleteCommentSchema.safeParse(input);
  if (!parse.success) {
    return { ok: false, error: "Invalid input." };
  }

  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("comments")
    .select("id, application_id, author_id")
    .eq("id", parse.data.commentId)
    .maybeSingle();
  if (existingError || !existing) {
    return { ok: false, error: "Note not found." };
  }
  if (existing.author_id !== admin.id) {
    return { ok: false, error: "You can only delete your own notes." };
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", parse.data.commentId);
  if (error) {
    return { ok: false, error: "Could not delete the note." };
  }

  revalidatePath(`/hr/applications/${existing.application_id}`);

  return { ok: true, commentId: parse.data.commentId };
}
