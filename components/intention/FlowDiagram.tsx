"use client";

import { Check, Clock, Flag, GitBranch, Lock, Play } from "lucide-react";
import { KIND_META } from "@/components/ui/icons";
import { blockingStep } from "@/lib/actions/next";
import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/time";
import type { Intention, Step } from "@/types";

export type StepState = "done" | "current" | "waiting" | "locked" | "todo";

export function stepState(i: Intention, s: Step, currentId?: string): StepState {
  if (s.done) return "done";
  if (blockingStep(i, s)) return "locked";
  if (s.owner) return "waiting";
  return s.id === currentId ? "current" : "todo";
}

const NODE: Record<StepState, string> = {
  done: "bg-emerald-500 text-white border-emerald-500",
  current: "bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100",
  waiting: "bg-amber-100 text-amber-700 border-amber-300",
  locked: "bg-slate-100 text-slate-400 border-slate-200",
  todo: "bg-white text-slate-500 border-slate-300",
};

export function FlowDiagram({
  intention,
  currentId,
  selectedId,
  onSelect,
}: {
  intention: Intention;
  currentId?: string;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const steps = intention.steps;
  const allDone = steps.every((s) => s.done);

  return (
    <div role="list" aria-label="Task flow diagram" className="relative">
      <FlowEnd icon={Play} label="Start" done />
      {steps.map((s, n) => {
        const state = stepState(intention, s, currentId);
        const Kind = KIND_META[s.kind ?? "mental"].icon;
        const Icon = state === "done" ? Check : state === "locked" ? Lock : state === "waiting" ? Clock : Kind;
        const prev = steps[n - 1];
        const dep = s.blockedBy ? steps.findIndex((x) => x.id === s.blockedBy) : -1;
        const jump = dep >= 0 && dep !== n - 1;
        const selected = s.id === selectedId;
        return (
          <div key={s.id} role="listitem" className={cn("relative flex gap-3", s.owner && "pl-6")}>
            <div className="flex w-10 shrink-0 flex-col items-center">
              <span className={cn("h-5 w-0.5", prev?.done || n === 0 ? "bg-emerald-300" : "bg-slate-200")} />
              <span className={cn("grid h-10 w-10 place-items-center rounded-full border-2 transition", NODE[state])}>
                <Icon aria-hidden className="h-4 w-4" strokeWidth={state === "done" ? 3 : 2} />
              </span>
              <span className={cn("w-0.5 flex-1", s.done ? "bg-emerald-300" : "bg-slate-200")} />
            </div>
            <button
              onClick={() => onSelect(s.id)}
              aria-pressed={selected}
              className={cn(
                "my-2 min-w-0 flex-1 rounded-2xl border p-3.5 text-left transition",
                selected ? "border-indigo-400 bg-indigo-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300",
                state === "locked" && "opacity-70",
              )}
            >
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Step {n + 1}
                <span className="font-semibold normal-case tracking-normal">
                  {KIND_META[s.kind ?? "mental"].label}
                  {s.minutes ? ` · ${formatDuration(s.minutes)}` : ""}
                </span>
              </span>
              <span className={cn("mt-1 block text-[15px] font-semibold leading-snug", s.done && "text-slate-400 line-through")}>
                {s.title}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {state === "current" && <span className="font-bold text-indigo-600">Do this now</span>}
                {s.owner && <span className="font-semibold text-amber-700">Owner: {s.owner}</span>}
                {jump && (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <GitBranch aria-hidden className="h-3 w-3" />
                    After step {dep + 1}
                  </span>
                )}
              </span>
            </button>
          </div>
        );
      })}
      <FlowEnd icon={Flag} label="Done" done={allDone} />
    </div>
  );
}

function FlowEnd({ icon: Icon, label, done }: { icon: typeof Flag; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2",
          done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-slate-400",
        )}
      >
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  );
}
