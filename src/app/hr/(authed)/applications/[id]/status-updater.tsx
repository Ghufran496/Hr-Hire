"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  StatusBadge,
  statusLabel,
} from "@/components/brand/status-badge";
import { updateApplicationStatusAction } from "@/lib/actions/applications";
import type { ApplicationStatus } from "@/lib/supabase/types";

export function StatusUpdater({
  applicationId,
  initialStatus,
}: {
  applicationId: string;
  initialStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [draft, setDraft] = useState<ApplicationStatus>(initialStatus);
  const [pending, startTransition] = useTransition();

  function save() {
    if (draft === status) return;
    startTransition(async () => {
      const result = await updateApplicationStatusAction({
        applicationId,
        status: draft,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setStatus(result.status);
      toast.success(
        result.emailed
          ? `Status updated to ${statusLabel(result.status)} - email sent.`
          : `Status updated to ${statusLabel(result.status)}.`,
      );
      router.refresh();
    });
  }

  const dirty = draft !== status;

  return (
    <article className="border-border bg-background rounded-xl border p-6">
      <h2 className="font-heading text-foreground text-lg font-semibold">
        Status
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Move this candidate through the workflow.
      </p>

      <div className="mt-4">
        <StatusBadge status={status} />
      </div>

      <div className="mt-5 space-y-3">
        <Select
          value={draft}
          onValueChange={(v) => setDraft(v as ApplicationStatus)}
        >
          <SelectTrigger aria-label="Update status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={save}
          disabled={!dirty || pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Update status"
          )}
        </Button>
      </div>
    </article>
  );
}
