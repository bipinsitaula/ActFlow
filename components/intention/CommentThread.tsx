"use client";

import { useState } from "react";
import { MessageSquareText, Send, Trash2 } from "lucide-react";
import type { Comment } from "@/types";

export function CommentThread({
  comments,
  onAdd,
  onDelete,
}: {
  comments: Comment[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  }

  return (
    <section aria-label="Comments">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <MessageSquareText aria-hidden className="h-4 w-4" />
        Comments
        {comments.length > 0 && <span className="text-slate-400">({comments.length})</span>}
      </h2>

      {comments.length > 0 && (
        <ul className="mb-3 space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="group rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="whitespace-pre-wrap text-sm text-slate-700">{c.text}</p>
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                <time dateTime={c.at}>
                  {new Date(c.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </time>
                <button
                  onClick={() => onDelete(c.id)}
                  aria-label="Delete comment"
                  className="rounded p-1 text-slate-300 transition hover:text-rose-600 focus-visible:text-rose-600"
                >
                  <Trash2 aria-hidden className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
          }}
          rows={2}
          maxLength={500}
          aria-label="Add a comment"
          placeholder="Add a note, blocker or update..."
          className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          aria-label="Post comment"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Send aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
