"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** success = green (good), error = red (problem), warning = amber (needs attention), info = indigo. */
export type Tone = "info" | "success" | "error" | "warning";
type Show = (message: string, tone?: Tone) => void;

const STYLE: Record<Tone, { icon: LucideIcon; box: string; label: string }> = {
  success: { icon: CheckCircle2, box: "bg-emerald-600 text-white", label: "Success" },
  error: { icon: AlertCircle, box: "bg-rose-600 text-white", label: "Problem" },
  warning: { icon: AlertTriangle, box: "bg-amber-400 text-slate-900", label: "Heads up" },
  info: { icon: Info, box: "bg-indigo-600 text-white", label: "Info" },
};

const ToastContext = createContext<Show>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: Tone; key: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback<Show>((message, tone = "info") => {
    clearTimeout(timer.current);
    setToast({ message, tone, key: Date.now() });
    // problems stay a little longer so they can be read
    timer.current = setTimeout(() => setToast(null), tone === "error" ? 5000 : 3200);
  }, []);

  const s = toast ? STYLE[toast.tone] : null;
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && s && (
        <div
          key={toast.key}
          role={toast.tone === "error" ? "alert" : "status"}
          data-tone={toast.tone}
          className={cn(
            "rise fixed bottom-24 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl py-3 pl-4 pr-2 text-sm font-semibold shadow-xl",
            s.box,
          )}
        >
          <s.icon aria-hidden className="h-5 w-5 shrink-0" />
          <span>
            <span className="sr-only">{s.label}: </span>
            {toast.message}
          </span>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg opacity-70 transition hover:opacity-100"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
