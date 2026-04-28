import { createClient } from "@/lib/supabase/server";
import type { JobRow } from "@/lib/supabase/types";
import { JobsManager } from "./jobs-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage jobs",
};

export default async function HRJobsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load jobs: ${error.message}`);
  }
  const jobs = (data ?? []) as JobRow[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          HR - jobs
        </span>
        <h1 className="font-heading text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Manage open roles
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Create new postings or toggle existing roles open and closed.
        </p>
      </header>

      <JobsManager initialJobs={jobs} />
    </div>
  );
}
