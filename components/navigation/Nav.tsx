"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tab =
  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors desktop:md:flex-none desktop:md:flex-row desktop:md:gap-2 desktop:md:rounded-xl desktop:md:px-4 desktop:md:text-sm desktop:md:hover:bg-slate-50";

export function Nav() {
  const path = usePathname();
  if (path === "/login") return null;
  const on = (p: string) => path.startsWith(p);
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-10 flex items-center rounded-b-[2rem] border-t border-slate-100 bg-white/95 px-6 py-2 backdrop-blur desktop:md:order-first desktop:md:top-0 desktop:md:justify-center desktop:md:gap-2 desktop:md:rounded-b-none desktop:md:rounded-t-[2rem] desktop:md:border-b desktop:md:border-t-0"
    >
      <Link href="/dashboard" className={cn(tab, on("/dashboard") || on("/intention") ? "text-indigo-600" : "text-slate-400")}>
        <Home aria-hidden className="h-5 w-5" />
        Now
      </Link>
      <Link
        href="/create"
        aria-label="New intention"
        className="mx-2 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition active:scale-95"
      >
        <Plus aria-hidden className="h-6 w-6" />
      </Link>
      <Link href="/rank" className={cn(tab, on("/rank") ? "text-indigo-600" : "text-slate-400")}>
        <Trophy aria-hidden className="h-5 w-5" />
        Rank
      </Link>
      <Link href="/leaderboard" className={cn(tab, on("/leaderboard") ? "text-indigo-600" : "text-slate-400")}>
        <Users aria-hidden className="h-5 w-5" />
        Board
      </Link>
    </nav>
  );
}
