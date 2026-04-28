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
