import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/brand/job-card";
import { Surface } from "@/components/brand/surface";
import { fetchOpenJobs } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestJobs, user] = await Promise.all([
    fetchOpenJobs(3),
    getCurrentUser(),
  ]);
  const role = user?.role ?? null;

  return (
    <>
      {/* Hero */}
      <section className="border-border bg-secondary/30 border-b">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="border-border bg-background text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="text-brand size-3.5" aria-hidden="true" />
            Now hiring across multiple roles
          </span>
          <h1 className="font-heading text-foreground max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
            Hire smarter. <span className="text-brand">Apply faster.</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-base sm:text-lg">
            SMARTHIRE is a modern applicant tracking system. Browse open roles,
            apply with a single form, and let our HR team handle the rest - all
            from one clean place.
          </p>
          <div className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-brand text-primary-foreground hover:bg-brand-hover"
            >
              <Link href="/jobs">
                Browse open roles
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            {role === "admin" ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/hr/dashboard">Go to dashboard</Link>
              </Button>
            ) : role === "candidate" ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/candidate/dashboard">My applications</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline">
                <Link href="/hr/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for clean, modern hiring
          </h2>
          <p className="text-muted-foreground mt-3">
            Three things SMARTHIRE does well - and nothing else getting in the
            way.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Benefit
            icon={<FileText className="size-5" aria-hidden="true" />}
            title="One simple form"
            body="Candidates apply with a single PDF CV and a short form. No account required, no friction."
          />
          <Benefit
            icon={<ShieldCheck className="size-5" aria-hidden="true" />}
            title="Secure HR access"
            body="A protected dashboard with status workflows, comments, and a candidate-by-candidate review."
          />
          <Benefit
            icon={<Sparkles className="size-5" aria-hidden="true" />}
            title="Mobile responsive"
            body="The same fast experience whether your team is at a desk or reviewing on a phone."
          />
        </div>
      </section>

      {/* Latest jobs */}
      <section className="border-border bg-secondary/30 border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-heading text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                Latest open roles
              </h2>
              <p className="text-muted-foreground mt-2">
                A small sample. See everything on the jobs board.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/jobs">
                View all jobs
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {latestJobs.length === 0 ? (
            <div className="border-border bg-background rounded-xl border border-dashed p-10 text-center">
              <h3 className="font-heading text-foreground text-lg font-semibold">
                No open roles yet
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Once HR posts a job from the dashboard, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Surface hoverable>
      <div className="bg-secondary text-foreground mb-4 inline-flex size-10 items-center justify-center rounded-full">
        {icon}
      </div>
      <h3 className="font-heading text-foreground text-lg font-semibold">
        {title}
      </h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {body}
      </p>
    </Surface>
  );
}
