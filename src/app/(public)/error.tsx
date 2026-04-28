"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <div className="bg-status-rejected text-status-rejected-foreground inline-flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-heading text-foreground mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <Button
        onClick={() => reset()}
        className="bg-brand text-primary-foreground hover:bg-brand-hover mt-8"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
