import { fetchOpenJobs } from "@/lib/jobs";
import { JobCard } from "@/components/brand/job-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Open roles",
};

export default async function JobsListingPage() {
  const jobs = await fetchOpenJobs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mb-12 max-w-2xl">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          Open roles
        </span>
        <h1 className="font-heading text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Find your next role at SMARTHIRE
        </h1>
        <p className="text-muted-foreground mt-4 text-base">
          Browse open positions below. Click a role to read the full description
          and apply with your CV.
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="border-border bg-secondary/30 rounded-xl border border-dashed p-12 text-center">
          <h2 className="font-heading text-foreground text-xl font-semibold">
            No open roles right now
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Check back soon - new openings are posted regularly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
