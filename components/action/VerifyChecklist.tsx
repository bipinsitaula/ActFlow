"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Step } from "@/types";

export const verifyItems = (s: Step) =>
  s.verify?.length ? s.verify : ["I finished this step"];

export function VerifyChecklist({
  items,
  checks,
  onToggle,
  disabled,
}: {
  items: string[];
  checks: boolean[];
  onToggle: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <ul className="space-y-2">
      {items.map((label, n) => (
        <li key={label}>
          <button
            type="button"
            role="checkbox"
            aria-checked={!!checks[n]}
            disabled={disabled}
            onClick={() => onToggle(n)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition disabled:opacity-50",
              checks[n]
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                checks[n] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white",
              )}
            >
              {checks[n] && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
