"use client";

import { useCallback, useSyncExternalStore } from "react";
import { listUsers } from "@/hooks/useAuth";
import { isComplete } from "@/lib/actions/next";
import { streak, xpOf } from "@/lib/actions/rank";
import type { Intention } from "@/types";

export interface Stats {
  xp: number;
  steps: number;
  finished: number;
  streak: number;
}

export const statsOf = (all: Intention[]): Stats => ({
  xp: xpOf(all).total,
  steps: all.flatMap((i) => i.steps).filter((s) => s.done).length,
  finished: all.filter(isComplete).length,
  streak: streak(all),
});

export interface LocalRow extends Stats {
  id: string;
  name: string;
}

/** Ranks every account on this device using each account's real saved intentions. */
export function localBoard(): LocalRow[] {
  return listUsers()
    .map((u) => {
      let data: Intention[] = [];
      try {
        data = JSON.parse(localStorage.getItem(`actflow:intentions:${u.id}`) ?? "[]") as Intention[];
      } catch {
        // unreadable data counts as empty
      }
      return { ...u, ...statsOf(data) };
    })
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
}

const listeners = new Set<() => void>();
const optKey = (id: string) => `actflow:lb:${id}`;

/** Joining the global board is opt-in, because it shares your name and score with the server. */
export function useGlobalOptIn(userId: string | undefined) {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  const on = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return !!userId && localStorage.getItem(optKey(userId)) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const set = useCallback(
    (value: boolean) => {
      if (!userId) return;
      try {
        if (value) localStorage.setItem(optKey(userId), "1");
        else localStorage.removeItem(optKey(userId));
      } catch {
        // preference just won't persist
      }
      listeners.forEach((l) => l());
    },
    [userId],
  );
  return [on, set] as const;
}

export async function pushScore(id: string, name: string, s: Stats) {
  await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, ...s }),
  });
}

export async function leaveGlobal(id: string) {
  await fetch(`/api/leaderboard?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}
