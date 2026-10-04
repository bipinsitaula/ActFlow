import { MODES } from "@/lib/friction/catalog";
import { cn } from "@/lib/utils/cn";
import type { Mode } from "@/types";
import { MODE_ICON } from "./icons";

export function ModeBadge({ mode, className }: { mode: Mode; className?: string }) {
  const m = MODES[mode];
  const Icon = MODE_ICON[mode];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        m.tone,
        className,
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {m.label}
    </span>
  );
}
