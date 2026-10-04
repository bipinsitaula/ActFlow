"use client";

import { ArrowRight, BadgeCheck, GitFork } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Eyebrow } from "@/components/ui/Card";
import { criteriaScore } from "@/lib/actions/next";
import { cn } from "@/lib/utils/cn";
import type { Intention } from "@/types";

export function DecisionPanel({
  intention,
  onToggle,
  onDecide,
}: {
  intention: Intention;
  onToggle: (criterionId: string) => void;
  onDecide: (v: "go" | "pass") => void;
}) {
  const d = intention.decision;
  if (!d) return null;
  const { met, total } = criteriaScore(intention);
  const ratio = total ? met / total : 0;
  const lean = ratio >= 0.6 ? "go" : ratio >= 0.4 ? "maybe" : "wait";

  return (
    <Card className="ring-violet-200">
      <Eyebrow className="flex items-center gap-1.5 text-violet-700">
        <GitFork aria-hidden className="h-3.5 w-3.5" />
        Check before you decide
      </Eyebrow>
      <p className="mt-2 text-sm text-muted">Unsure about: {d.unsure}</p>
      <ul className="mt-4 space-y-2">
        {d.criteria.map((c) => (
          <li key={c.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={c.met}
                onChange={() => onToggle(c.id)}
                disabled={!!d.decided}
                className="mt-0.5 h-4 w-4 accent-[#4338ca]"
              />
              <span className="text-[15px]">{c.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "mt-4 rounded-xl p-4 text-sm",
          lean === "go" && "bg-emerald-50 text-emerald-900",
          lean === "maybe" && "bg-amber-50 text-amber-900",
          lean === "wait" && "bg-neutral-100 text-neutral-700",
        )}
      >
        <p className="font-semibold">
          You meet {met}/{total} of these.
        </p>
        <p className="mt-1">
          {lean === "go"
            ? d.recommendation
            : lean === "maybe"
              ? "It's close. Take the smallest reversible step and see how it goes."
              : "Tick what's true for you. If most stay unchecked, do a bit more research first."}
        </p>
      </div>

      {d.decided ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-emerald-600" />
          {d.decided === "go"
            ? "You decided to go for it. Steps unlocked below."
            : "You decided to pass. That's a decision too."}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => onDecide("go")}>
            Go for it
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => onDecide("pass")}>
            Pass on this
          </Button>
        </div>
      )}
    </Card>
  );
}
