import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export type AuthedUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
};

/**
 * Resolve the current request's user + role from `public.users`.
 * Cached per-request (React cache) so multiple callers in the same render
 * don't multiply round-trips.
 *
 * IMPORTANT: never read role from `user.user_metadata` - that field is
 * user-modifiable and cannot be trusted for authorization.
 */
export const getCurrentUser = cache(async (): Promise<AuthedUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
  };
});

/**
 * Require an admin user. Redirects to /hr/login or / when the check fails.
 * Use in server components and server actions that must be admin-only.
 */
export async function requireAdmin(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/hr/login");
  if (user.role !== "admin") redirect("/candidate/dashboard");
  return user;
}

export async function requireCandidate(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/hr/login");
  if (user.role === "admin") redirect("/hr/dashboard");
  return user;
}
