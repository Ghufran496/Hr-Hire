"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createJobAction,
  updateJobAction,
  toggleJobOpenAction,
  deleteJobAction,
} from "@/lib/actions/jobs";
import { jobSchema, type JobInput } from "@/lib/validation/job";
import { formatDate } from "@/lib/format";
import type { JobRow } from "@/lib/supabase/types";

type EditorMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; job: JobRow };

const EMPTY_FORM: JobInput = {
  title: "",
  short_description: "",
  description: "",
  requirements: "",
  location: "",
  employment_type: "Full-time",
};

function jobToFormValues(job: JobRow): JobInput {
  return {
    title: job.title,
    short_description: job.short_description,
    description: job.description,
    requirements: job.requirements,
    location: job.location ?? "",
    employment_type: job.employment_type ?? "",
  };
}

export function JobsManager({ initialJobs }: { initialJobs: JobRow[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobRow[]>(initialJobs);
  const [editor, setEditor] = useState<EditorMode>({ kind: "closed" });
  const [submitting, startSubmit] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<JobRow | null>(null);

  const form = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: EMPTY_FORM,
  });

  function openCreate() {
    form.reset(EMPTY_FORM);
    setEditor({ kind: "create" });
  }

  function openEdit(job: JobRow) {
    form.reset(jobToFormValues(job));
    setEditor({ kind: "edit", job });
  }

  function closeEditor() {
    setEditor({ kind: "closed" });
  }

  function submit(values: JobInput) {
    startSubmit(async () => {
      if (editor.kind === "create") {
        const result = await createJobAction(values);
        if (!result.ok) {
          if (result.fieldErrors) {
            for (const [name, messages] of Object.entries(result.fieldErrors)) {
              const message = messages?.[0];
              if (message) {
                form.setError(name as keyof JobInput, {
                  type: "server",
                  message,
                });
              }
            }
          }
          toast.error(result.error);
          return;
        }
        setJobs((j) => [result.job, ...j]);
        toast.success("Job posted.");
        form.reset(EMPTY_FORM);
        closeEditor();
        router.refresh();
        return;
      }

      if (editor.kind === "edit") {
        const result = await updateJobAction({
          ...values,
          id: editor.job.id,
        });
        if (!result.ok) {
          if (result.fieldErrors) {
            for (const [name, messages] of Object.entries(result.fieldErrors)) {
              const message = messages?.[0];
              if (message) {
                form.setError(name as keyof JobInput, {
                  type: "server",
                  message,
                });
              }
            }
          }
          toast.error(result.error);
          return;
        }
        setJobs((all) =>
          all.map((j) => (j.id === result.job.id ? result.job : j)),
        );
        toast.success("Job updated.");
        closeEditor();
        router.refresh();
      }
    });
  }

  async function toggleOpen(job: JobRow) {
    setTogglingId(job.id);
    try {
      const result = await toggleJobOpenAction({
        jobId: job.id,
        isOpen: !job.is_open,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setJobs((all) =>
        all.map((j) =>
          j.id === job.id ? { ...j, is_open: result.isOpen } : j,
        ),
      );
      toast.success(result.isOpen ? "Job activated." : "Job deactivated.");
    } finally {
      setTogglingId(null);
    }
  }

  async function performDelete(job: JobRow) {
    setDeletingId(job.id);
    try {
      const result = await deleteJobAction({ jobId: job.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setJobs((all) => all.filter((j) => j.id !== job.id));
      toast.success("Job deleted.");
      setConfirmDelete(null);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const dialogOpen = editor.kind !== "closed";

  return (
    <section className="border-border bg-background rounded-xl border">
      <div className="border-border flex flex-col items-start justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-foreground text-lg font-semibold">
            All postings
          </h2>
          <p className="text-muted-foreground text-sm">
            {jobs.length} job{jobs.length === 1 ? "" : "s"} total
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(next) => {
            if (!next) closeEditor();
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              className="bg-brand text-primary-foreground hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden="true" />
              New job
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-xl">
            <DialogHeader className="border-border border-b p-4">
              <DialogTitle>
                {editor.kind === "edit" ? "Edit role" : "Post a new role"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(submit)}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Senior Frontend Engineer"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="employment_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment type</FormLabel>
                          <FormControl>
                            <Input placeholder="Full-time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Remote / Berlin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short description</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full description</FormLabel>
                        <FormControl>
                          <Textarea rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="m-0 rounded-b-xl">
                  <Button type="button" variant="outline" onClick={closeEditor}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand text-primary-foreground hover:bg-brand-hover"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                        {editor.kind === "edit" ? "Saving..." : "Posting..."}
                      </>
                    ) : editor.kind === "edit" ? (
                      "Save changes"
                    ) : (
                      "Post job"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {jobs.length === 0 ? (
        <div className="p-12 text-center">
          <h3 className="font-heading text-foreground text-lg font-semibold">
            No jobs yet
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Click <span className="text-foreground font-medium">New job</span>{" "}
            to post your first role.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="text-foreground font-medium">
                      {job.title}
                    </div>
                    <div className="text-muted-foreground line-clamp-1 text-xs">
                      {job.short_description}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {job.location ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {formatDate(job.created_at)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        job.is_open
                          ? "bg-status-accepted text-status-accepted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                          : "bg-status-rejected text-status-rejected-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                      }
                    >
                      {job.is_open ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Open job actions"
                          disabled={
                            togglingId === job.id || deletingId === job.id
                          }
                        >
                          {togglingId === job.id || deletingId === job.id ? (
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <MoreHorizontal
                              className="size-4"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => openEdit(job)}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toggleOpen(job)}>
                          {job.is_open ? (
                            <PowerOff className="size-4" aria-hidden="true" />
                          ) : (
                            <Power className="size-4" aria-hidden="true" />
                          )}
                          {job.is_open ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setConfirmDelete(job)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this job?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            {confirmDelete ? (
              <>
                <span className="text-foreground font-medium">
                  {confirmDelete.title}
                </span>{" "}
                will be permanently removed along with all of its applications.
                This cannot be undone.
              </>
            ) : null}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={deletingId !== null}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingId !== null}
              onClick={() => {
                if (confirmDelete) performDelete(confirmDelete);
              }}
            >
              {deletingId !== null ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
