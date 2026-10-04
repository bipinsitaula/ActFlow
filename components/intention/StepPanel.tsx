"use client";

import { useState } from "react";
import { BadgeCheck, Hourglass, Lock, RotateCcw } from "lucide-react";
import { DurationEditor } from "@/components/ui/DurationEditor";
import { ResourceList } from "@/components/action/ResourceList";
import { VerifyChecklist, verifyItems } from "@/components/action/VerifyChecklist";
import { KIND_META } from "@/components/ui/icons";
import { blockingStep } from "@/lib/actions/next";
import type { Intention, Step } from "@/types";
import { stepState } from "./FlowDiagram";

export function StepPanel({
  intention,
  step,
  currentId,
  onComplete,
  onReopen,
  onDuration,
}: {
  intention: Intention;
  step: Step;
  currentId?: string;
  onComplete: () => void;
  onReopen: () => void;
  onDuration: (minutes: number) => void;
}) {
  const items = verifyItems(step);
  const [checks, setChecks] = useState<boolean[]>(() => items.map(() => false));
  const state = stepState(intention, step, currentId);
  const blocker = blockingStep(intention, step);
  const Kind = KIND_META[step.kind ?? "mental"];
  const locked = state === "locked";
  const allChecked = checks.every(Boolean);
  const hasLocation = step.resources?.some((r) => r.kind === "location");

  return (
    <section aria-label="Step details" className="rise space-y-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <header>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <Kind.icon aria-hidden className="h-4 w-4" />
          {Kind.label}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-snug">{step.title}</h3>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Hourglass aria-hidden className="h-3.5 w-3.5" />
          Time needed
          <DurationEditor minutes={step.minutes} onSave={onDuration} />
        </div>
        {step.detail && <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.detail}</p>}
      </header>

      {step.resources?.length ? (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            {hasLocation ? "Where to go and what to read" : "Learn how"}
          </h4>
          <ResourceList resources={step.resources} />
        </div>
      ) : null}

      {step.done ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          <span className="flex items-center gap-2 text-sm font-bold">
            <BadgeCheck aria-hidden className="h-5 w-5" />
            Verified and complete
          </span>
          <button onClick={onReopen} className="flex items-center gap-1 text-xs font-semibold underline decoration-dotted">
            <RotateCcw aria-hidden className="h-3 w-3" />
            Reopen
          </button>
        </div>
      ) : (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Verify before you move on</h4>
          {locked && (
            <p className="mb-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-3 text-sm font-medium text-slate-600">
              <Lock aria-hidden className="h-4 w-4 shrink-0" />
              Finish &ldquo;{blocker?.title}&rdquo; first.
            </p>
          )}
          <VerifyChecklist
            items={items}
            checks={checks}
            disabled={locked}
            onToggle={(n) => setChecks((c) => c.map((v, i) => (i === n ? !v : v)))}
          />
          <button
            onClick={onComplete}
            disabled={locked || !allChecked}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white shadow-lg transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <BadgeCheck aria-hidden className="h-5 w-5" />
            {step.owner ? "Mark as received" : "Verify and complete"}
          </button>
        </div>
      )}
    </section>
  );
}
