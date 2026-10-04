"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Status = { online: boolean; model: string; installed: boolean } | null;

/** Shows whether the local Gemma model is reachable, so it's clear what is planning your tasks. */
export function AiStatus() {
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    let alive = true;
    const check = () =>
      fetch("/api/ai/status")
        .then((r) => r.json() as Promise<NonNullable<Status>>)
        .then((s) => alive && setStatus(s))
        .catch(() => alive && setStatus({ online: false, model: "", installed: false }));
    void check();
    const t = setInterval(check, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!status) return <span className="h-7 w-32" aria-hidden />;
  const ready = status.online && status.installed;
  const label = ready
    ? `${status.model} ready`
    : status.online
      ? `Run: ollama pull ${status.model}`
      : "AI offline, using templates";

  return (
    <span
      role="status"
      title={ready ? "Plans are generated locally by your Ollama model" : "Start Ollama for AI-generated plans"}
      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200"
    >
      <span aria-hidden className={cn("h-2 w-2 rounded-full", ready ? "bg-emerald-500" : status.online ? "bg-amber-500" : "bg-slate-300")} />
      {label}
    </span>
  );
}
