import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JobNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <p className="text-brand text-xs font-semibold tracking-wider uppercase">
        404
      </p>
      <h1 className="font-heading text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Role not found
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        That role isn&apos;t open right now or has been removed.
      </p>
      <Button
        asChild
        className="bg-brand text-primary-foreground hover:bg-brand-hover mt-8"
      >
        <Link href="/jobs">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Browse open roles
        </Link>
      </Button>
    </div>
  );
}
