"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/types";

export type CheckRoleResult =
  | { ok: true; role: UserRole }
  | { ok: false; error: "not-found" };

/**
 * Returns the trusted `public.users.role` for the given user id.
 * Server-side, uses the service-role client so it works regardless of
 * whether the auth session has been fully established yet.
 */
export async function getTrustedRoleAction(
  userId: string,
): Promise<CheckRoleResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return { ok: false, error: "not-found" };
  return { ok: true, role: data.role };
}
