import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  reviewing: "Reviewing",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  applied: "bg-status-applied text-status-applied-foreground",
  reviewing: "bg-status-reviewing text-status-reviewing-foreground",
  interview: "bg-status-interview text-status-interview-foreground",
  accepted: "bg-status-accepted text-status-accepted-foreground",
  rejected: "bg-status-rejected text-status-rejected-foreground",
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "applied",
  "reviewing",
  "interview",
  "accepted",
  "rejected",
];

export function statusLabel(status: ApplicationStatus): string {
  return STATUS_LABEL[status];
}

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        STATUS_CLASS[status],
        className,
      )}
    >
      <span
        className="size-1.5 rounded-full bg-current opacity-70"
        aria-hidden="true"
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
