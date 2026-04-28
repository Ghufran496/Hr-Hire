"use client";

import { useState, useTransition } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addCommentAction } from "@/lib/actions/comments";
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
}: {
  applicationId: string;
  initialComments: CommentWithAuthorRow[];
}) {
  const [comments, setComments] =
    useState<CommentWithAuthorRow[]>(initialComments);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

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

  return (
    <article className="border-border bg-background rounded-xl border p-6">
      <h2 className="font-heading text-foreground flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="size-4" aria-hidden="true" />
        Internal notes
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Notes are visible to HR only.
      </p>

      <ul className="mt-5 space-y-4">
        {comments.length === 0 ? (
          <li className="border-border bg-secondary/30 text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
            No notes yet - be the first.
          </li>
        ) : (
          comments.map((c) => (
            <li
              key={c.id}
              className="border-border bg-secondary/40 flex gap-3 rounded-md border p-3"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {initials(c.author_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-foreground font-medium">
                    {c.author_name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(c.created_at)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">
                  {c.text}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="mt-5 space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note about this candidate…"
          rows={3}
        />
        <Button
          onClick={submit}
          disabled={pending || !text.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Posting…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              Post note
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
