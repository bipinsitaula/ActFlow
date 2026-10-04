"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, GitFork, Inbox, LogOut } from "lucide-react";
import { BlockerCard } from "@/components/friction/BlockerCard";
import { ModeBadge } from "@/components/ui/ModeBadge";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useIntentions } from "@/hooks/useIntentions";
import { blockersOf, decisionPending, isComplete, nextStep, progress } from "@/lib/actions/next";
import { rankIntentions, tierOf, xpOf } from "@/lib/actions/rank";
import { cn, greeting } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/time";
import type { Intention } from "@/types";

function Status({ i }: { i: Intention }) {
  const step = nextStep(i);
  const blocker = blockersOf(i).find((b) => b.blocked.length > 0);
  if (decisionPending(i)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700">
        <GitFork aria-hidden className="h-3 w-3" />
        Decision pending
      </span>
    );
  }
  if (!step && blocker) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
        <AlertTriangle aria-hidden className="h-3 w-3" />
        Waiting on {blocker.owner}
      </span>
    );
  }
  if (step) {
    return (
      <span className="block truncate text-xs text-slate-500">
        {step.minutes ? `${formatDuration(step.minutes)} · ` : ""}
        {step.title}
      </span>
    );
  }
  return null;
}

export default function Dashboard() {
  const { intentions, logReminder } = useIntentions();
  const { session, signOut } = useAuth();
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const toast = useToast();
  const toasted = useRef(false);

  const pendingCount = intentions?.filter((i) => !isComplete(i)).length ?? 0;
  useEffect(() => {
    if (intentions && !toasted.current && pendingCount > 0) {
      toasted.current = true;
      toast(`You have ${pendingCount} pending intention${pendingCount > 1 ? "s" : ""} waiting for action.`, "warning");
    }
  }, [intentions, pendingCount, toast]);

  if (!intentions) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-busy />;

  const ranked = rankIntentions(intentions);
  const completed = intentions.filter(isComplete);
  const blockers = ranked.flatMap((r) => blockersOf(r.intention)).filter((b) => b.blocked.length > 0).slice(0, 2);
  const xp = xpOf(intentions).total;
  const { tier } = tierOf(xp);
  const TierIcon = tier.icon;
  const first = session?.name.split(" ")[0];

  return (
    <div className="-mx-6 -mt-8 flex min-w-0 flex-col">
      <header className="flex items-start justify-between gap-3 p-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">ActFlow</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {greeting()}
            {first ? `, ${first}` : ""}. Turn intentions into reality.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/rank"
            className="rounded-xl bg-indigo-50 px-3 py-2 text-center text-xs font-bold text-indigo-700 hover:bg-indigo-100"
          >
            <span className="flex items-center gap-1">
              <TierIcon aria-hidden className="h-3.5 w-3.5" />
              {tier.name}
            </span>
            <span className="block font-semibold text-indigo-400">{xp} XP</span>
          </Link>
          <button
            onClick={() => {
              signOut();
              toast("You have been signed out.", "info");
            }}
            aria-label="Sign out"
            title="Sign out"
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div role="tablist" className="mt-4 flex gap-4 border-b border-slate-100 px-6">
        {(["pending", "completed"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 pb-3 text-sm font-semibold capitalize transition-colors",
              tab === t
                ? t === "pending"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-400 hover:text-slate-600",
            )}
          >
            {t}
            {t === "pending" && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-6">
        {tab === "pending" && (
          <>
            {blockers.map((b) => (
              <BlockerCard key={b.step.id} blocker={b} onReminded={logReminder} />
            ))}
            {ranked.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <Inbox aria-hidden className="h-7 w-7" />
                </div>
                <p className="font-medium text-slate-500">No pending intentions yet.</p>
                <Link href="/create" className="mt-3 inline-block text-sm font-semibold text-indigo-600 underline">
                  Add your first one
                </Link>
              </div>
            )}
            <div className="grid min-w-0 grid-cols-1 gap-4 desktop:md:grid-cols-2">
            {ranked.map(({ intention: i }, n) => {
              const step = nextStep(i);
              return (
                <div
                  key={i.id}
                  className="rise flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  style={{ animationDelay: `${n * 0.05}s` }}
                >
                  <span
                    aria-label={`Priority ${n + 1}`}
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold",
                      n === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {n + 1}
                  </span>
                  <Link href={`/intention/${i.id}`} className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-slate-800">{i.title}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <ModeBadge mode={i.mode} className="!px-2 !py-0.5 !text-[10px]" />
                      <span className="text-[10px] font-bold text-slate-400">{progress(i)}%</span>
                    </div>
                    <div className="mt-1 min-w-0">
                      <Status i={i} />
                    </div>
                  </Link>
                  <Link
                    href={step ? `/action/${i.id}?step=${step.id}` : `/intention/${i.id}`}
                    className="shrink-0 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                  >
                    {step ? "Start" : "Open"}
                  </Link>
                </div>
              );
            })}
            </div>
            {ranked.length > 0 && (
              <p className="text-center text-xs text-slate-400">
                Ranked by deadline, who&apos;s waiting on you, quick wins and momentum.
              </p>
            )}
          </>
        )}

        {tab === "completed" && (
          <>
            {completed.length === 0 && (
              <p className="py-12 text-center font-medium text-slate-500">No completed intentions yet.</p>
            )}
            {completed.map((i) => {
              const proof = i.steps.find((s) => s.proof)?.proof;
              return (
                <Link
                  key={i.id}
                  href={`/intention/${i.id}`}
                  className="rise flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <h4 className="truncate font-bold text-emerald-800/60 line-through">{i.title}</h4>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">
                      {i.steps.length} steps verified
                    </p>
                  </div>
                  {proof && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proof} alt="Proof" className="h-12 w-12 shrink-0 rounded-xl border-2 border-white object-cover shadow-sm" />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
