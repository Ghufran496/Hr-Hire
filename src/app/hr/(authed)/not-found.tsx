import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HRNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <p className="text-brand text-xs font-semibold tracking-wider uppercase">
        404
      </p>
      <h1 className="font-heading text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Not found
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        The candidate or job you were looking for doesn&apos;t exist or may have
        been removed.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/hr/jobs">Manage jobs</Link>
        </Button>
        <Button
          asChild
          className="bg-brand text-primary-foreground hover:bg-brand-hover"
        >
          <Link href="/hr/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
