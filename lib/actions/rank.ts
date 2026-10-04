import { Flag, Footprints, Rocket, Sprout, Zap, type LucideIcon } from "lucide-react";
import { blockersOf, decisionPending, isComplete, nextStep, progress } from "./next";
import type { Intention } from "@/types";

export const TIERS: { name: string; min: number; icon: LucideIcon }[] = [
  { name: "Starter", min: 0, icon: Sprout },
  { name: "Mover", min: 100, icon: Footprints },
  { name: "Doer", min: 300, icon: Zap },
  { name: "Finisher", min: 600, icon: Flag },
  { name: "Unstoppable", min: 1000, icon: Rocket },
];

export function xpOf(all: Intention[]) {
  const done = all.flatMap((i) => i.steps.filter((s) => s.done));
  const breakdown = {
    steps: done.reduce((n, s) => n + 10 + Math.min(s.minutes ?? 0, 30), 0),
    focus: all.reduce((n, i) => n + i.focusMinutes, 0),
    finished: all.filter(isComplete).length * 50,
    proof: done.filter((s) => s.proof).length * 5,
  };
  return { total: Object.values(breakdown).reduce((a, b) => a + b, 0), breakdown };
}

export function tierOf(xp: number) {
  let idx = 0;
  TIERS.forEach((t, n) => {
    if (xp >= t.min) idx = n;
  });
  const tier = TIERS[idx];
  const next = TIERS[idx + 1];
  const pct = next ? Math.round(((xp - tier.min) / (next.min - tier.min)) * 100) : 100;
  return { tier, next, pct };
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Consecutive days with at least one finished step, counting back from today (or yesterday). */
export function streak(all: Intention[]) {
  const days = new Set(
    all.flatMap((i) => i.steps.flatMap((s) => (s.doneAt ? [dayKey(new Date(s.doneAt))] : []))),
  );
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Higher means do it sooner: deadlines, people waiting on you, quick wins and momentum. */
export function priorityScore(i: Intention) {
  if (isComplete(i)) return -1;
  const step = nextStep(i);
  const waitingOnOthers = blockersOf(i).reduce((n, b) => n + b.blocked.length, 0);
  const ageDays = (Date.now() - new Date(i.createdAt).getTime()) / 86_400_000;
  return (
    (i.deadline ? 30 : 0) +
    waitingOnOthers * 10 +
    (step?.minutes && step.minutes <= 10 ? 15 : 0) +
    progress(i) / 5 +
    Math.min(ageDays, 10) * 2 -
    (decisionPending(i) ? 5 : 0) -
    (step ? 0 : 20)
  );
}

export function rankIntentions(all: Intention[]) {
  return all
    .filter((i) => !isComplete(i))
    .map((i) => ({ intention: i, score: priorityScore(i) }))
    .sort((a, b) => b.score - a.score);
}
