"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { useQueryState, parseAsString, parseAsStringEnum } from "nuqs";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  APPLICATION_STATUSES,
  StatusBadge,
  statusLabel,
} from "@/components/brand/status-badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/supabase/types";
import type { ApplicationListRow } from "./page";

const ALL = "all";
const STATUS_VALUES = [ALL, ...APPLICATION_STATUSES] as const;

type SortKey = "name" | "job" | "status" | "created";
type SortDir = "asc" | "desc";
const SORT_KEYS = ["name", "job", "status", "created"] as const;
const SORT_DIRS = ["asc", "desc"] as const;

const STATUS_ORDER: Record<ApplicationStatus, number> = {
  applied: 0,
  reviewing: 1,
  interview: 2,
  accepted: 3,
  rejected: 4,
};

export function DashboardClient({
  applications,
}: {
  applications: ApplicationListRow[];
}) {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringEnum([...STATUS_VALUES]).withDefault(ALL),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsStringEnum([...SORT_KEYS]).withDefault("created"),
  );
  const [sortDir, setSortDir] = useQueryState(
    "dir",
    parseAsStringEnum([...SORT_DIRS]).withDefault("desc"),
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = applications.filter((app) => {
      const matchesSearch =
        !q ||
        app.full_name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === ALL || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return a.full_name.localeCompare(b.full_name) * direction;
        case "job":
          return (
            (a.jobs?.title ?? "").localeCompare(b.jobs?.title ?? "") * direction
          );
        case "status":
          return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * direction;
        case "created":
          return (
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()) *
            direction
          );
      }
    });

    return sorted;
  }, [applications, search, statusFilter, sortBy, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir(key === "created" ? "desc" : "asc");
    }
  }

  return (
    <section className="border-border bg-background rounded-xl border">
      <div className="border-border flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value || null)}
            placeholder="Search by name or email"
            className="pl-9"
            aria-label="Search applicants"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v === ALL ? null : (v as ApplicationStatus))
          }
        >
          <SelectTrigger
            className="w-full md:w-56"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {APPLICATION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <div className="p-12 text-center">
          <h3 className="font-heading text-foreground text-lg font-semibold">
            {applications.length === 0
              ? "No applications yet"
              : "No matching applications"}
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            {applications.length === 0
              ? "When candidates submit applications they will appear here."
              : "Try a different search or status filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <SortableHead
                  active={sortBy === "name"}
                  dir={sortDir}
                  onClick={() => toggleSort("name")}
                >
                  Name
                </SortableHead>
                <SortableHead
                  active={sortBy === "job"}
                  dir={sortDir}
                  onClick={() => toggleSort("job")}
                >
                  Job
                </SortableHead>
                <SortableHead
                  active={sortBy === "status"}
                  dir={sortDir}
                  onClick={() => toggleSort("status")}
                >
                  Status
                </SortableHead>
                <SortableHead
                  active={sortBy === "created"}
                  dir={sortDir}
                  onClick={() => toggleSort("created")}
                  className="hidden md:table-cell"
                >
                  Submitted
                </SortableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="text-foreground font-medium">
                      {app.full_name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {app.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {app.jobs?.title ?? "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {formatDate(app.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/hr/applications/${app.id}`}
                      className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      View
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function SortableHead({
  active,
  dir,
  onClick,
  className,
  children,
}: {
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "hover:text-foreground inline-flex items-center gap-1.5 transition-colors",
          active ? "text-foreground" : "text-muted-foreground",
        )}
        aria-label={`Sort by ${children} ${
          active && dir === "asc" ? "descending" : "ascending"
        }`}
      >
        {children}
        <Icon className="size-3.5" aria-hidden="true" />
      </button>
    </TableHead>
  );
}
