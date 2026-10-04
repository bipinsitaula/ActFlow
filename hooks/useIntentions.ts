"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getSession, subscribeSession } from "@/hooks/useAuth";
import { uid } from "@/lib/utils/cn";
import type { Assessment, Intention, Plan, SkillInput } from "@/types";

const keyFor = () => `actflow:intentions:${getSession()?.id ?? "anon"}`;

let cache: { key: string; data: Intention[] } | null = null;
const listeners = new Set<() => void>();

function read(): Intention[] {
  const key = keyFor();
  if (cache?.key !== key) {
    let data: Intention[] = [];
    try {
      data = JSON.parse(localStorage.getItem(key) ?? "[]") as Intention[];
    } catch {
      // corrupt data: start empty
    }
    cache = { key, data };
  }
  return cache.data;
}

function write(next: Intention[]) {
  const key = keyFor();
  cache = { key, data: next };
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // storage unavailable: keep in-memory state for this session
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const offSession = subscribeSession(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("actflow:intentions:")) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    offSession();
    window.removeEventListener("storage", onStorage);
  };
}

const serverSnapshot = () => null;

/** `intentions` is null until the browser store has loaded. */
export function useIntentions() {
  const intentions = useSyncExternalStore(subscribe, read, serverSnapshot);

  const update = useCallback((id: string, fn: (i: Intention) => Intention) => {
    write(
      read().map((i) =>
        i.id === id ? { ...fn(i), updatedAt: new Date().toISOString() } : i,
      ),
    );
  }, []);

  const add = useCallback(
    (input: {
      text: string;
      title: string;
      choice: string;
      deadline?: string | null;
      plan: Plan;
      skills?: SkillInput[];
      assessment?: Assessment;
      comment?: string;
    }) => {
      const { plan } = input;
      const ids = plan.steps.map(() => uid());
      const now = new Date().toISOString();
      const intention: Intention = {
        id: uid(),
        text: input.text,
        title: input.title,
        mode: plan.mode,
        choice: input.choice,
        deadline: input.deadline ?? undefined,
        summary: plan.summary,
        steps: plan.steps.map((s, n) => ({
          id: ids[n],
          title: s.title,
          minutes: s.minutes,
          owner: s.owner,
          micro: s.micro?.length ? s.micro : undefined,
          kind: s.kind,
          detail: s.detail,
          verify: s.verify,
          resources: s.resources,
          blockedBy: s.blockedByIndex !== undefined ? ids[s.blockedByIndex] : undefined,
          done: false,
        })),
        decision: plan.decision && {
          unsure: plan.decision.unsure,
          recommendation: plan.decision.recommendation,
          criteria: plan.decision.criteria.map((label) => ({ id: uid(), label, met: false })),
        },
        skills: input.skills,
        assessment: input.assessment,
        comments: input.comment?.trim() ? [{ id: uid(), text: input.comment.trim(), at: now }] : [],
        focusMinutes: 0,
        reminders: [],
        source: plan.source,
        createdAt: now,
        updatedAt: now,
      };
      write([intention, ...read()]);
      return intention.id;
    },
    [],
  );

  const toggleStep = useCallback(
    (id: string, stepId: string) =>
      update(id, (i) => ({
        ...i,
        steps: i.steps.map((s) =>
          s.id === stepId
            ? { ...s, done: !s.done, doneAt: s.done ? undefined : new Date().toISOString(), proof: s.done ? undefined : s.proof }
            : s,
        ),
      })),
    [update],
  );

  const completeStep = useCallback(
    (id: string, stepId: string, proof?: string) =>
      update(id, (i) => ({
        ...i,
        steps: i.steps.map((s) =>
          s.id === stepId ? { ...s, done: true, doneAt: new Date().toISOString(), proof } : s,
        ),
      })),
    [update],
  );

  const toggleCriterion = useCallback(
    (id: string, criterionId: string) =>
      update(id, (i) =>
        i.decision
          ? {
              ...i,
              decision: {
                ...i.decision,
                criteria: i.decision.criteria.map((c) =>
                  c.id === criterionId ? { ...c, met: !c.met } : c,
                ),
              },
            }
          : i,
      ),
    [update],
  );

  const decide = useCallback(
    (id: string, verdict: "go" | "pass") =>
      update(id, (i) => (i.decision ? { ...i, decision: { ...i.decision, decided: verdict } } : i)),
    [update],
  );

  const addFocus = useCallback(
    (id: string, minutes: number) => update(id, (i) => ({ ...i, focusMinutes: i.focusMinutes + minutes })),
    [update],
  );

  const logReminder = useCallback(
    (id: string, stepId: string, owner: string) =>
      update(id, (i) => ({
        ...i,
        reminders: [...i.reminders, { stepId, owner, at: new Date().toISOString() }],
      })),
    [update],
  );

  const setStepDuration = useCallback(
    (id: string, stepId: string, minutes: number) =>
      update(id, (i) => ({
        ...i,
        steps: i.steps.map((s) => (s.id === stepId ? { ...s, minutes } : s)),
      })),
    [update],
  );

  const addComment = useCallback(
    (id: string, text: string) =>
      update(id, (i) => ({
        ...i,
        comments: [...(i.comments ?? []), { id: uid(), text: text.trim(), at: new Date().toISOString() }],
      })),
    [update],
  );

  const deleteComment = useCallback(
    (id: string, commentId: string) =>
      update(id, (i) => ({ ...i, comments: (i.comments ?? []).filter((c) => c.id !== commentId) })),
    [update],
  );

  const remove = useCallback((id: string) => write(read().filter((i) => i.id !== id)), []);

  return { intentions, add, toggleStep, completeStep, toggleCriterion, decide, addFocus, logReminder, setStepDuration, addComment, deleteComment, remove };
}
