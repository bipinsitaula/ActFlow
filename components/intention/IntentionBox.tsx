"use client";

import { Sparkles } from "lucide-react";
import { EXAMPLES } from "@/lib/friction/catalog";
import { Button } from "@/components/ui/Button";

export function IntentionBox({
  value,
  onChange,
  onSubmit,
  busy,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  return (
    <div>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-action sm:p-5">
        <label htmlFor="intention" className="text-sm font-semibold">
          What are you trying to accomplish?
        </label>
        <textarea
          id="intention"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && value.trim()) onSubmit();
          }}
          rows={3}
          maxLength={500}
          placeholder="I need to prepare for my physics exam…"
          className="mt-2 w-full resize-none bg-transparent text-lg leading-snug outline-none placeholder:text-neutral-400"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="hidden text-xs text-muted sm:block">Ctrl + Enter to continue</span>
          <Button onClick={onSubmit} disabled={busy || !value.trim()} className="ml-auto">
            <Sparkles aria-hidden className="h-4 w-4" />
            {busy ? "Understanding..." : "Make it actionable"}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => onChange(ex)}
            className="rounded-full bg-white px-3 py-1.5 text-xs text-muted ring-1 ring-line transition hover:text-ink hover:ring-action"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
