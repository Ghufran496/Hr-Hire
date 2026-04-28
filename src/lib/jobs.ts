import { createClient } from "@/lib/supabase/server";
import type { JobRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes("YOUR-PROJECT") || key.includes("YOUR-")) return false;
  return true;
}

/**
 * Fetch open jobs ordered by recency.
 * Returns an empty array when Supabase env vars are still placeholders so
 * the dev experience without a real project doesn't blow up. Real fetch
 * failures are thrown so they hit the route's `error.tsx` boundary.
 */
export async function fetchOpenJobs(limit?: number): Promise<JobRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  let query = supabase
    .from("jobs")
    .select("*")
    .eq("is_open", true)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load jobs: ${error.message}`);
  }
  return data ?? [];
}

export async function fetchJobById(id: string): Promise<JobRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load job: ${error.message}`);
  }
  return data ?? null;
}
