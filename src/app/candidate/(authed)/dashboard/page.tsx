import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { requireCandidate } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { ApplicationRow, JobRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My applications",
};

type ApplicationWithJob = ApplicationRow & {
  jobs: Pick<JobRow, "id" | "title"> | null;
};

const STATUS_LABEL: Record<ApplicationRow["status"], string> = {
  applied: "Applied",
  reviewing: "Under review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Not selected",
};

function statusClass(status: ApplicationRow["status"]): string {
  switch (status) {
    case "accepted":
      return "bg-status-accepted text-status-accepted-foreground";
    case "rejected":
      return "bg-status-rejected text-status-rejected-foreground";
    case "interview":
      return "bg-status-interview text-status-interview-foreground";
    case "reviewing":
      return "bg-status-reviewing text-status-reviewing-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export default async function CandidateDashboardPage() {
  const user = await requireCandidate();

  const admin = createAdminClient();

  // Backfill: link any guest-submitted applications matching this email
  // to the user, so they appear in the dashboard going forward.
  await admin
    .from("applications")
    .update({ user_id: user.id })
    .is("user_id", null)
    .eq("email", user.email);

  const { data, error } = await admin
    .from("applications")
    .select("*, jobs:jobs(id, title)")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load applications: ${error.message}`);
  }

  const applications = (data ?? []) as ApplicationWithJob[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          Candidate
        </span>
        <h1 className="font-heading text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          My applications
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {applications.length === 0
            ? "You have not applied to any roles yet."
            : `${applications.length} application${applications.length === 1 ? "" : "s"} on file.`}
        </p>
      </header>

      {applications.length === 0 ? (
        <div className="border-border bg-background rounded-xl border p-10 text-center">
          <div className="bg-secondary text-foreground mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-foreground text-lg font-semibold">
            Nothing here yet
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Browse the open roles and submit your first application.
          </p>
          <Button
            asChild
            className="bg-brand text-primary-foreground hover:bg-brand-hover mt-6"
          >
            <Link href="/jobs">
              Browse open roles
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : (
        <section className="border-border bg-background overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/60">
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Applied
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Last update
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="text-foreground font-medium">
                        {app.jobs?.title ?? "Role no longer listed"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {app.full_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {formatDate(app.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {formatDate(app.updated_at)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(app.status)}`}
                      >
                        {STATUS_LABEL[app.status]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
}
