import Link from "next/link";
import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import type { JobRow } from "@/lib/supabase/types";
import { formatDate } from "@/lib/format";

export function JobCard({ job }: { job: JobRow }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group border-border bg-card hover:border-foreground/20 flex h-full flex-col justify-between rounded-xl border p-6 transition hover:shadow-md"
    >
      <div className="space-y-3">
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          <Briefcase className="size-3.5" aria-hidden="true" />
          <span>{job.employment_type ?? "Full-time"}</span>
          {job.location ? (
            <>
              <span
                className="bg-border size-1 rounded-full"
                aria-hidden="true"
              />
              <MapPin className="size-3.5" aria-hidden="true" />
              <span>{job.location}</span>
            </>
          ) : null}
        </div>
        <h3 className="font-heading text-foreground text-xl leading-tight font-semibold">
          {job.title}
        </h3>
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {job.short_description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Posted {formatDate(job.created_at)}
        </span>
        <span className="text-brand inline-flex items-center gap-1 font-medium transition-transform group-hover:translate-x-0.5">
          View role
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
