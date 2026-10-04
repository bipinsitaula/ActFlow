"use client";

import { useState } from "react";
import { ArrowRight, Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MODE_ICON } from "@/components/ui/icons";
import { MODES } from "@/lib/friction/catalog";
import { cn } from "@/lib/utils/cn";
import type { Analysis, FrictionOption } from "@/types";

export function FrictionSelector({
  analysis,
  busy,
  onSubmit,
}: {
  analysis: Analysis;
  busy: boolean;
  /** `option` is null when the user only wrote their own comment. */
  onSubmit: (option: FrictionOption | null, comment: string) => void;
}) {
  const [picked, setPicked] = useState<FrictionOption | null>(null);
  const [comment, setComment] = useState("");
  const m = MODES[analysis.mode];
  const ready = !!picked || comment.trim().length > 0;

  return (
    <div className="rise">
      <p className="text-sm text-slate-500">
        Looks like <span className="font-semibold text-slate-800">{m.friction.toLowerCase()}</span>. {m.blurb}
      </p>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{analysis.question}</h2>
      <p className="mt-1 text-sm text-slate-500">Pick the closest one, or tell us in your own words below.</p>

      <div role="radiogroup" aria-label={analysis.question} className="mt-5 grid gap-2.5">
        {analysis.options.map((o) => {
          const Icon = MODE_ICON[o.mode];
          const on = picked?.label === o.label;
          return (
            <button
              key={o.label}
              role="radio"
              aria-checked={on}
              disabled={busy}
              onClick={() => setPicked(on ? null : o)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left text-[15px] transition disabled:opacity-60",
                on ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:border-indigo-300",
              )}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              {o.label}
            </button>
          );
        })}
      </div>

      <label className="mt-5 block">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <MessageSquareText aria-hidden className="h-4 w-4 text-slate-500" />
          Something else? Add a comment
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={400}
          disabled={busy}
          placeholder="Anything the options above don't cover..."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </label>

      <Button
        onClick={() => onSubmit(picked, comment.trim())}
        disabled={!ready || busy}
        className="mt-4 w-full !rounded-2xl !py-3.5"
      >
        {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
        {busy ? "Building your path..." : "Build my path"}
        {!busy && <ArrowRight aria-hidden className="h-4 w-4" />}
      </Button>
    </div>
  );
}
