"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BadgeCheck, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function FocusTimer({
  minutes,
  title,
  subtitle,
  children,
  canComplete = true,
  onElapsed,
  onFinish,
  onCancel,
}: {
  minutes: number;
  title: string;
  subtitle: string;
  /** Rendered between the timer and the action buttons (proof upload, checklist). */
  children?: ReactNode;
  /** Disable the finish button until the step has been verified. */
  canComplete?: boolean;
  /** Called with whole minutes actually spent when the user finishes. */
  onElapsed: (spentMinutes: number) => void;
  onFinish: () => void;
  onCancel: () => void;
}) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const endsAt = useRef(0);
  const reported = useRef(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const remaining = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) setRunning(false);
    }, 250);
    return () => clearInterval(t);
  }, [running]);

  const finished = left === 0;
  const spent = finished ? minutes : Math.round((total - left) / 60);

  function start() {
    endsAt.current = Date.now() + left * 1000;
    setRunning(true);
  }

  function complete() {
    if (!reported.current) {
      reported.current = true;
      onElapsed(spent);
    }
    onFinish();
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="-mx-6 -mt-8 flex flex-col">
      <div className="relative rounded-b-[2rem] bg-indigo-600 p-8 pb-10 text-center text-white shadow-lg">
        <button
          onClick={onCancel}
          aria-label="Leave session"
          className="absolute left-6 top-6 text-indigo-200 transition-colors hover:text-white"
        >
          <X aria-hidden className="h-6 w-6" />
        </button>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-200">Sprint goal: do it now</h2>
        <div
          role="timer"
          className={cn(
            "font-mono text-6xl font-black tracking-tighter tabular-nums",
            left < 60 && !finished && "text-rose-300",
          )}
        >
          {mm}:{ss}
        </div>
        <p className="mt-2 font-medium text-indigo-100">{subtitle}</p>
      </div>

      <div className="mx-auto w-full max-w-xl space-y-6 p-6">
        <h1 className="text-center text-xl font-bold leading-snug tracking-tight">{title}</h1>
        {children}
        <div className="flex gap-3">
          {!finished && (
            <button
              onClick={running ? () => setRunning(false) : start}
              className="flex-1 rounded-2xl bg-slate-100 py-4 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              {running ? "Pause" : left === total ? "Start timer" : "Resume"}
            </button>
          )}
          <button
            onClick={complete}
            disabled={!canComplete}
            className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-semibold text-white shadow-lg transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <BadgeCheck aria-hidden className="h-5 w-5" />
            Verify and finish
          </button>
        </div>
      </div>
    </div>
  );
}
