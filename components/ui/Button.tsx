import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-action text-white hover:bg-action-dark shadow-sm shadow-indigo-900/20",
  dark: "bg-ink text-white hover:bg-black",
  ghost: "bg-white text-ink ring-1 ring-line hover:bg-neutral-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  warn: "bg-amber-500 text-ink hover:bg-amber-400",
};
type Variant = keyof typeof variants;

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
