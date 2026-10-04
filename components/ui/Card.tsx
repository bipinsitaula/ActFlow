import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rise rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6", className)}
      {...props}
    />
  );
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs font-semibold uppercase tracking-[0.14em] text-muted", className)}
      {...props}
    />
  );
}
