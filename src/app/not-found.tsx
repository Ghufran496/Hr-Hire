import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Logo size="lg" />
      <p className="text-brand mt-8 text-xs font-semibold tracking-wider uppercase">
        404
      </p>
      <h1 className="font-heading text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        The page you were looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/jobs">Browse jobs</Link>
        </Button>
        <Button
          asChild
          className="bg-brand text-primary-foreground hover:bg-brand-hover"
        >
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
