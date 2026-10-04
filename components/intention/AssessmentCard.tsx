"use client";

import { ArrowRight, Check, CircleAlert, OctagonAlert, TrendingUp, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { Assessment } from "@/types";

const VERDICT: Record<
  Assessment["verdict"],
  { label: string; icon: LucideIcon; box: string; bar: string; text: string }
> = {
  go: { label: "Ready to go", icon: Check, box: "border-emerald-200 bg-emerald-50", bar: "bg-emerald-500", text: "text-emerald-800" },
  prepare: { label: "Prepare first", icon: TrendingUp, box: "border-amber-200 bg-amber-50", bar: "bg-amber-500", text: "text-amber-900" },
  reconsider: { label: "Consider a different goal", icon: OctagonAlert, box: "border-rose-200 bg-rose-50", bar: "bg-rose-500", text: "text-rose-900" },
};

export function AssessmentCard({
  assessment: a,
  onContinue,
  onAlternative,
  onStop,
  busy,
}: {
  assessment: Assessment;
  /** Present on the create screen, absent on the read-only view. */
  onContinue?: () => void;
  onAlternative?: (goal: string) => void;
  onStop?: () => void;
  busy?: boolean;
}) {
  const v = VERDICT[a.verdict];
  const Icon = v.icon;
  const interactive = !!onContinue;

  return (
    <section aria-label="Skill fit" className={cn("rise rounded-2xl border p-5", v.box)}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn("flex items-center gap-2 text-sm font-bold", v.text)}>
          <Icon aria-hidden className="h-5 w-5" />
          {v.label}
        </p>
        <span className={cn("text-xs font-bold tabular-nums", v.text)}>{a.score}% ready</span>
      </div>
      <div
        role="progressbar"
        aria-label="Readiness"
        aria-valuenow={a.score}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/70"
      >
        <div className={cn("h-full rounded-full", v.bar)} style={{ width: `${a.score}%` }} />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-700">{a.summary}</p>

      {a.strengths.length > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">What you have</h3>
          <ul className="mt-2 space-y-1.5">
            {a.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-700">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.gaps.length > 0 && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">What&apos;s missing</h3>
          <ul className="mt-2 space-y-1.5">
            {a.gaps.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-slate-700">
                <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.advice && <p className="mt-4 text-sm font-semibold text-slate-800">{a.advice}</p>}

      {a.alternatives.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">More realistic goals</h3>
          <ul className="mt-2 space-y-2">
            {a.alternatives.map((alt) => (
              <li key={alt}>
                {onAlternative ? (
                  <button
                    onClick={() => onAlternative(alt)}
                    disabled={busy}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold transition hover:border-indigo-400 disabled:opacity-60"
                  >
                    {alt}
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-indigo-600" />
                  </button>
                ) : (
                  <span className="text-sm text-slate-700">{alt}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {interactive && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={onContinue} disabled={busy} variant={a.verdict === "reconsider" ? "ghost" : "primary"}>
            {a.verdict === "go" ? "Continue" : a.verdict === "prepare" ? "Plan my preparation" : "Continue anyway"}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Button>
          {onStop && (
            <button onClick={onStop} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              Not now
            </button>
          )}
        </div>
      )}

      {a.source === "fallback" && (
        <p className="mt-4 text-xs text-slate-500">
          Quick built-in check. It&apos;s guidance, not a verdict on you. You always decide.
        </p>
      )}
    </section>
  );
}
