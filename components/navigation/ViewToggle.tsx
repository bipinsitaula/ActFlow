"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Smartphone, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type View = "mobile" | "desktop";
const KEY = "actflow:view";
const listeners = new Set<() => void>();

const read = (): View => (document.documentElement.dataset.view === "desktop" ? "desktop" : "mobile");

function set(v: View) {
  document.documentElement.dataset.view = v;
  try {
    localStorage.setItem(KEY, v);
  } catch {
    // preference just won't persist
  }
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const OPTIONS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "desktop", label: "Desktop", icon: Monitor },
];

export function ViewToggle() {
  const view = useSyncExternalStore(subscribe, read, () => "mobile" as View);
  return (
    <div role="group" aria-label="Layout mode" className="inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => set(id)}
          aria-pressed={view === id}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            view === id ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-800",
          )}
        >
          <Icon aria-hidden className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
