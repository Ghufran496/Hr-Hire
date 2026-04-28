"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignedCvUrlAction } from "@/lib/actions/applications";

type State =
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "error"; message: string };

export function CvViewer({
  applicationId,
  candidateName,
}: {
  applicationId: string;
  candidateName: string;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getSignedCvUrlAction(applicationId);
      if (cancelled) return;
      if (result.ok) {
        setState({ kind: "ready", url: result.url });
      } else {
        setState({ kind: "error", message: result.error });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  return (
    <article className="border-border bg-background rounded-xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-foreground text-lg font-semibold">
          CV preview
        </h2>
        {state.kind === "ready" ? (
          <Button asChild size="sm" variant="outline">
            <a href={state.url} target="_blank" rel="noopener noreferrer">
              Open in new tab
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>

      <div className="border-border bg-secondary/30 mt-4 overflow-hidden rounded-md border">
        {state.kind === "loading" ? (
          <div className="text-muted-foreground flex h-[60vh] min-h-[24rem] items-center justify-center">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Loading CV…
          </div>
        ) : state.kind === "error" ? (
          <div className="text-muted-foreground flex h-[60vh] min-h-[24rem] flex-col items-center justify-center gap-3 px-6 text-center text-sm">
            <FileWarning
              className="text-destructive size-6"
              aria-hidden="true"
            />
            <span>{state.message}</span>
          </div>
        ) : (
          <iframe
            src={state.url}
            title={`CV - ${candidateName}`}
            className="h-[70vh] min-h-[24rem] w-full"
          />
        )}
      </div>
    </article>
  );
}
