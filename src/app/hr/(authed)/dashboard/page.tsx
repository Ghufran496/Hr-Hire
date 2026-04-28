import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import type { ApplicationRow, JobRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

export type ApplicationListRow = ApplicationRow & {
  jobs: Pick<JobRow, "id" | "title"> | null;
};

export default async function HRDashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*, jobs:jobs(id, title)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load applications: ${error.message}`);
  }

  const applications = (data ?? []) as ApplicationListRow[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            HR dashboard
          </span>
          <h1 className="font-heading text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Applicants
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {applications.length === 0
              ? "No applications yet."
              : `${applications.length} application${applications.length === 1 ? "" : "s"} received.`}
          </p>
        </div>
      </header>

      <DashboardClient applications={applications} />
    </div>
  );
}
