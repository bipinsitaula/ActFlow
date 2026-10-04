import type { Intention, Step } from "@/types";

export interface Blocker {
  intention: Intention;
  step: Step;
  owner: string;
  /** Undone steps that are waiting, directly or indirectly, on this one. */
  blocked: Step[];
}

export const isComplete = (i: Intention) => i.steps.length > 0 && i.steps.every((s) => s.done);

export const progress = (i: Intention) =>
  i.steps.length ? Math.round((i.steps.filter((s) => s.done).length / i.steps.length) * 100) : 0;

export const decisionPending = (i: Intention) => !!i.decision && !i.decision.decided;

/**
 * The unfinished step that must come first, if any. Steps with an explicit dependency wait on it;
 * in every mode except coordinate the others implicitly wait on the step before them.
 */
export function blockingStep(i: Intention, s: Step): Step | undefined {
  const idx = i.steps.indexOf(s);
  const dep = s.blockedBy
    ? i.steps.find((x) => x.id === s.blockedBy)
    : i.mode === "coordinate"
      ? undefined
      : i.steps[idx - 1];
  return dep && !dep.done ? dep : undefined;
}

const isUnblocked = (i: Intention, s: Step) => !blockingStep(i, s);

/** The first step the user themselves can do right now. */
export function nextStep(i: Intention): Step | undefined {
  if (decisionPending(i) || i.decision?.decided === "pass") return undefined;
  return i.steps.find((s) => !s.done && !s.owner && isUnblocked(i, s));
}

export function blockersOf(i: Intention): Blocker[] {
  const out: Blocker[] = [];
  for (const step of i.steps) {
    if (step.done || !step.owner) continue;
    const blocked: Step[] = [];
    const queue = [step.id];
    while (queue.length) {
      const id = queue.shift()!;
      for (const s of i.steps) {
        if (!s.done && s.blockedBy === id) {
          blocked.push(s);
          queue.push(s.id);
        }
      }
    }
    out.push({ intention: i, step, owner: step.owner, blocked });
  }
  return out.sort((a, b) => b.blocked.length - a.blocked.length);
}

/** Pick the single most useful thing to do now across all intentions. */
export function pickNext(all: Intention[]) {
  const candidates = all
    .filter((i) => !isComplete(i))
    .flatMap((i) => {
      const step = nextStep(i);
      return step ? [{ intention: i, step }] : [];
    });
  candidates.sort(
    (a, b) =>
      (a.step.minutes ?? 99) - (b.step.minutes ?? 99) ||
      b.intention.updatedAt.localeCompare(a.intention.updatedAt),
  );
  return candidates[0];
}

export function criteriaScore(i: Intention) {
  const c = i.decision?.criteria ?? [];
  return { met: c.filter((x) => x.met).length, total: c.length };
}
