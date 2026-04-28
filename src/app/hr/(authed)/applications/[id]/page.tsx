import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type {
  ApplicationRow,
  CommentWithAuthorRow,
  JobRow,
} from "@/lib/supabase/types";
import { StatusBadge } from "@/components/brand/status-badge";
import { Surface } from "@/components/brand/surface";
import { formatDateTime } from "@/lib/format";
import { StatusUpdater } from "./status-updater";
import { CommentsThread } from "./comments-thread";
import { CvViewer } from "./cv-viewer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate",
};

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: application }, { data: comments }] = await Promise.all([
    supabase
      .from("applications")
      .select("*, jobs:jobs(id, title, location, employment_type)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("comments_with_author")
      .select("*")
      .eq("application_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!application) notFound();

  const app = application as ApplicationRow & {
    jobs: Pick<JobRow, "id" | "title" | "location" | "employment_type"> | null;
  };
  const commentList = (comments ?? []) as CommentWithAuthorRow[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/hr/dashboard"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <header className="border-border mt-6 flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {app.full_name}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Applied for{" "}
            <span className="text-foreground font-medium">
              {app.jobs?.title ?? "-"}
            </span>{" "}
            on {formatDateTime(app.created_at)}
          </p>
        </div>
        <StatusBadge status={app.status} className="text-sm" />
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <Surface as="article">
            <h2 className="font-heading text-foreground text-lg font-semibold">
              Contact
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Mail className="size-3.5" aria-hidden="true" />
                  Email
                </dt>
                <dd className="text-foreground mt-1">
                  <a href={`mailto:${app.email}`} className="hover:underline">
                    {app.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Phone className="size-3.5" aria-hidden="true" />
                  Phone
                </dt>
                <dd className="text-foreground mt-1">{app.phone}</dd>
              </div>
            </dl>
          </Surface>

          <Surface as="article">
            <h2 className="font-heading text-foreground text-lg font-semibold">
              Experience
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-line">
              {app.experience}
            </p>
          </Surface>

          <Surface as="article">
            <h2 className="font-heading text-foreground text-lg font-semibold">
              Skills
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {app.skills}
            </p>
          </Surface>

          <CvViewer applicationId={app.id} candidateName={app.full_name} />
        </section>

        <aside className="space-y-6">
          <StatusUpdater applicationId={app.id} initialStatus={app.status} />
          <CommentsThread
            applicationId={app.id}
            initialComments={commentList}
          />
        </aside>
      </div>
    </div>
  );
}
