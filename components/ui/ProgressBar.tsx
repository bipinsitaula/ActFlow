import { cn } from "@/lib/utils/cn";

export function ProgressBar({
  value,
  tone = "bg-action",
  label,
}: {
  value: number;
  tone?: string;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"
      >
        <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold tabular-nums text-muted">{value}%</span>
    </div>
  );
}
