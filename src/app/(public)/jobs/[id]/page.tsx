import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchJobById } from "@/lib/jobs";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await fetchJobById(id);
  return { title: job?.title ?? "Job not found" };
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await fetchJobById(id);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/jobs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to all roles
      </Link>

      <header className="border-border mt-8 border-b pb-8">
        <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {job.title}
        </h1>
        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="size-4" aria-hidden="true" />
            {job.employment_type ?? "Full-time"}
          </span>
          {job.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {job.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-4" aria-hidden="true" />
            Posted {formatDate(job.created_at)}
          </span>
        </div>
        <p className="text-muted-foreground mt-6 text-base">
          {job.short_description}
        </p>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-brand text-primary-foreground hover:bg-brand-hover"
          >
            <Link href={`/jobs/${job.id}/apply`}>
              Apply for this role
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="mt-10 space-y-10">
        <article>
          <h2 className="font-heading text-foreground text-xl font-semibold">
            About the role
          </h2>
          <div className="text-muted-foreground mt-4 text-base leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </article>

        <article>
          <h2 className="font-heading text-foreground text-xl font-semibold">
            Requirements
          </h2>
          <div className="text-muted-foreground mt-4 text-base leading-relaxed whitespace-pre-line">
            {job.requirements}
          </div>
        </article>
      </section>

      <footer className="border-border bg-secondary/30 mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border p-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-heading text-foreground text-lg font-semibold">
            Ready to apply?
          </h3>
          <p className="text-muted-foreground text-sm">
            It only takes a few minutes - upload your PDF CV and submit.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-brand text-primary-foreground hover:bg-brand-hover"
        >
          <Link href={`/jobs/${job.id}/apply`}>Start application</Link>
        </Button>
      </footer>
    </div>
  );
}
