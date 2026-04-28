"use client";

import { useState, useTransition } from "react";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from "@/lib/actions/comments";
import { formatDateTime } from "@/lib/format";
import type { CommentWithAuthorRow } from "@/lib/supabase/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CommentsThread({
  applicationId,
  initialComments,
  currentUserId,
}: {
  applicationId: string;
  initialComments: CommentWithAuthorRow[];
  currentUserId: string;
}) {
  const [comments, setComments] =
    useState<CommentWithAuthorRow[]>(initialComments);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, startSaveEdit] = useTransition();
  const [confirmDelete, setConfirmDelete] =
    useState<CommentWithAuthorRow | null>(null);
  const [deleting, startDelete] = useTransition();

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await addCommentAction({
        applicationId,
        text: trimmed,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setComments((c) => [...c, result.comment]);
      setText("");
      toast.success("Note added.");
    });
  }

  function startEdit(c: CommentWithAuthorRow) {
    setEditingId(c.id);
    setEditingText(c.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function saveEdit(commentId: string) {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    startSaveEdit(async () => {
      const result = await updateCommentAction({
        commentId,
        text: trimmed,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setComments((all) =>
        all.map((c) => (c.id === commentId ? result.comment : c)),
      );
      cancelEdit();
      toast.success("Note updated.");
    });
  }

  function performDelete(c: CommentWithAuthorRow) {
    startDelete(async () => {
      const result = await deleteCommentAction({ commentId: c.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setComments((all) => all.filter((x) => x.id !== c.id));
      setConfirmDelete(null);
      toast.success("Note deleted.");
    });
  }

  return (
    <article className="border-border bg-background overflow-hidden rounded-xl border">
      <header className="border-border bg-secondary/30 border-b px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-foreground flex items-center gap-2 text-base font-semibold">
              <span className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-full">
                <MessageSquare className="size-4" aria-hidden="true" />
              </span>
              Internal notes
            </h2>
            <p className="text-muted-foreground mt-1 ml-9 text-xs">
              Visible to HR only - candidates never see these.
            </p>
          </div>
          <span className="text-muted-foreground border-border bg-background rounded-full border px-2 py-0.5 text-xs font-medium">
            {comments.length}
          </span>
        </div>
      </header>

      <ul className="space-y-3 px-6 py-5">
        {comments.length === 0 ? (
          <li className="border-border bg-secondary/20 text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm">
            <MessageSquare className="size-5 opacity-50" aria-hidden="true" />
            <span>No notes yet. Add the first one below.</span>
          </li>
        ) : (
          comments.map((c) => {
            const isOwn = c.author_id === currentUserId;
            const isEditing = editingId === c.id;
            return (
              <li
                key={c.id}
                className={`group relative flex gap-3 rounded-lg border px-3 py-3 transition-colors ${
                  isOwn
                    ? "border-brand/20 bg-brand/[0.04] hover:bg-brand/[0.06]"
                    : "border-border bg-secondary/30 hover:bg-secondary/40"
                }`}
              >
                <Avatar
                  className={`size-9 shrink-0 ring-2 ${isOwn ? "ring-brand/30" : "ring-border"}`}
                >
                  <AvatarFallback
                    className={`text-xs font-semibold ${isOwn ? "bg-brand/10 text-brand" : ""}`}
                  >
                    {initials(c.author_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-foreground truncate text-sm font-semibold">
                        {c.author_name}
                      </span>
                      {isOwn ? (
                        <span className="bg-brand/10 text-brand rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                          You
                        </span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <time
                        dateTime={c.created_at}
                        className="text-muted-foreground text-xs"
                      >
                        {formatDateTime(c.created_at)}
                      </time>
                      {isOwn && !isEditing ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground -mr-1 opacity-60 group-hover:opacity-100 focus-visible:opacity-100"
                              aria-label="Note actions"
                            >
                              <MoreHorizontal
                                className="size-4"
                                aria-hidden="true"
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onSelect={() => startEdit(c)}>
                              <Pencil className="size-4" aria-hidden="true" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setConfirmDelete(c)}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={savingEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(c.id)}
                          disabled={savingEdit || !editingText.trim()}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {savingEdit ? (
                            <>
                              <Loader2
                                className="size-4 animate-spin"
                                aria-hidden="true"
                              />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-foreground/90 mt-1.5 text-sm leading-relaxed whitespace-pre-line">
                      {c.text}
                    </p>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className="border-border bg-secondary/20 space-y-3 border-t px-6 py-4">
        <label
          htmlFor="new-note"
          className="text-foreground text-xs font-semibold tracking-wide uppercase"
        >
          Add a note
        </label>
        <Textarea
          id="new-note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share context, interview impressions, or follow-ups..."
          rows={3}
          className="bg-background resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">
            {text.length > 0 ? `${text.trim().length} / 4000` : null}
          </span>
          <Button
            onClick={submit}
            disabled={pending || !text.trim()}
            className="bg-brand text-primary-foreground hover:bg-brand-hover"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Posting...
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden="true" />
                Post note
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this note?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This note will be permanently removed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                if (confirmDelete) performDelete(confirmDelete);
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
