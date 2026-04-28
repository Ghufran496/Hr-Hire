import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchJobById } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/auth";
import { ApplicationForm } from "./application-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await fetchJobById(id);
  return {
    title: job ? `Apply: ${job.title}` : "Apply",
  };
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, user] = await Promise.all([fetchJobById(id), getCurrentUser()]);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href={`/jobs/${job.id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to role
      </Link>

      <header className="mt-8 mb-10">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          Application
        </span>
        <h1 className="font-heading text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Apply for {job.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-base">
          Fill in your details and attach your CV (PDF, max 5 MB). We&apos;ll
          get back to you once HR has reviewed your application.
        </p>
      </header>

      <ApplicationForm
        jobId={job.id}
        jobTitle={job.title}
        defaultName={user?.fullName ?? ""}
        defaultEmail={user?.email ?? ""}
      />
    </div>
  );
}
