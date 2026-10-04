"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useIntentions } from "@/hooks/useIntentions";
import { isComplete } from "@/lib/actions/next";
import { TIERS, rankIntentions, streak, tierOf, xpOf } from "@/lib/actions/rank";
import { cn } from "@/lib/utils/cn";

export default function RankPage() {
  const { intentions } = useIntentions();
  if (!intentions) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-busy />;

  const { total, breakdown } = xpOf(intentions);
  const { tier, next, pct } = tierOf(total);
  const TierIcon = tier.icon;
  const days = streak(intentions);
  const ranked = rankIntentions(intentions);

  const stats = [
    { label: "Day streak", value: days },
    { label: "Steps done", value: intentions.flatMap((i) => i.steps).filter((s) => s.done).length },
    { label: "Finished", value: intentions.filter(isComplete).length },
    { label: "Focus min", value: breakdown.focus },
  ];
  const rows = [
    ["Steps completed", breakdown.steps],
    ["Focus minutes", breakdown.focus],
    ["Intentions finished", breakdown.finished],
    ["Proof photos", breakdown.proof],
  ] as const;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Your rank</h1>

      <section className="rise rounded-3xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-200">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Current rank</p>
        <p className="mt-2 flex items-center gap-3 text-4xl font-extrabold tracking-tight">
          <TierIcon aria-hidden className="h-9 w-9" />
          {tier.name}
        </p>
        <p className="mt-1 text-sm text-indigo-100">{total} XP</p>
        <div className="mt-4 text-indigo-100 [&_span]:!text-indigo-100 [&_[role=progressbar]]:!bg-indigo-400/40">
          <ProgressBar value={pct} tone="bg-white" label="Progress to next rank" />
        </div>
        <p className="mt-2 text-xs text-indigo-200">
          {next ? `${next.min - total} XP to ${next.name}` : "Top rank reached."}
        </p>
      </section>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-lg font-extrabold tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Where your XP comes from</h2>
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 text-sm">
          {rows.map(([label, v]) => (
            <li key={label} className="flex justify-between px-4 py-3">
              <span className="text-slate-600">{label}</span>
              <span className="font-bold tabular-nums">+{v}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Rank ladder</h2>
        <ol className="space-y-2">
          {TIERS.map((t) => (
            <li
              key={t.name}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3 text-sm",
                t.name === tier.name ? "bg-indigo-50 font-bold text-indigo-700 ring-1 ring-indigo-200" : "bg-slate-50 text-slate-500",
              )}
            >
              <span className="flex items-center gap-2">
                <t.icon aria-hidden className="h-4 w-4" />
                {t.name}
              </span>
              <span className="text-xs tabular-nums">{t.min} XP</span>
            </li>
          ))}
        </ol>
      </section>

      {ranked.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Priority ranking</h2>
          <ol className="space-y-2">
            {ranked.map(({ intention: i, score }, n) => (
              <li key={i.id}>
                <Link
                  href={`/intention/${i.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <span className="font-extrabold text-indigo-600">#{n + 1}</span>
                  <span className="flex-1 truncate font-semibold">{i.title}</span>
                  <span className="text-xs tabular-nums text-slate-400">{Math.round(score)} pts</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
