"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, Globe, Laptop, LogOut, Medal, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useIntentions } from "@/hooks/useIntentions";
import { tierOf } from "@/lib/actions/rank";
import { cn } from "@/lib/utils/cn";
import { leaveGlobal, localBoard, pushScore, statsOf, useGlobalOptIn } from "@/lib/leaderboard/client";

interface GlobalRow {
  rank: number;
  name: string;
  xp: number;
  steps: number;
  finished: number;
  streak: number;
  you: boolean;
}
interface GlobalData {
  rows: GlobalRow[];
  total: number;
  you: { rank: number; xp: number } | null;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const tone = ["bg-amber-100 text-amber-600", "bg-slate-100 text-slate-500", "bg-orange-100 text-orange-600"][rank - 1];
    const Icon = rank === 1 ? Crown : Medal;
    return (
      <span aria-label={`Rank ${rank}`} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", tone)}>
        <Icon aria-hidden className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span aria-label={`Rank ${rank}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-50 text-sm font-extrabold text-slate-500">
      {rank}
    </span>
  );
}

function Row({ rank, name, xp, steps, finished, you }: { rank: number; name: string; xp: number; steps: number; finished: number; you: boolean }) {
  const { tier } = tierOf(xp);
  const Icon = tier.icon;
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3",
        you ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white",
      )}
    >
      <RankBadge rank={rank} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate font-bold text-slate-800">
          {name}
          {you && <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">You</span>}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Icon aria-hidden className="h-3 w-3" />
          {tier.name} · {steps} steps · {finished} finished
        </p>
      </div>
      <span className="text-right">
        <span className="block text-lg font-extrabold tabular-nums text-slate-800">{xp}</span>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">XP</span>
      </span>
    </li>
  );
}

export default function LeaderboardPage() {
  const { session } = useAuth();
  const { intentions } = useIntentions();
  const toast = useToast();
  const [tab, setTab] = useState<"global" | "local">("global");
  const [optedIn, setOptIn] = useGlobalOptIn(session?.id);
  const [data, setData] = useState<GlobalData | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const mine = useMemo(() => (intentions ? statsOf(intentions) : null), [intentions]);
  const local = useMemo(() => localBoard(), [intentions]); // eslint-disable-line react-hooks/exhaustive-deps

  const sid = session?.id ?? "";
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/leaderboard?id=${encodeURIComponent(sid)}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData((await res.json()) as GlobalData);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [sid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const t = setInterval(refresh, 20_000);
    return () => clearInterval(t);
  }, [refresh]);

  async function join() {
    if (!session || !mine) return;
    setBusy(true);
    try {
      await pushScore(session.id, session.name, mine);
      setOptIn(true);
      await refresh();
      toast("You joined the global leaderboard.", "success");
    } catch {
      toast("Couldn't reach the leaderboard server.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (!session) return;
    setBusy(true);
    try {
      await leaveGlobal(session.id);
      setOptIn(false);
      await refresh();
      toast("You left the global leaderboard. Your score was removed.", "warning");
    } catch {
      toast("Couldn't reach the leaderboard server.", "error");
    } finally {
      setBusy(false);
    }
  }

  const myLocalRank = local.findIndex((r) => r.id === session?.id) + 1;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Your XP</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-indigo-900">{mine?.xp ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {tab === "global" ? "Global rank" : "Device rank"}
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">
            {tab === "global" ? (data?.you ? `#${data.you.rank}` : "-") : myLocalRank ? `#${myLocalRank}` : "-"}
          </p>
        </div>
      </div>

      <div role="tablist" className="flex gap-2 rounded-2xl bg-slate-100 p-1">
        {(
          [
            ["global", "Global", Globe],
            ["local", "This device", Laptop],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition",
              tab === id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800",
            )}
          >
            <Icon aria-hidden className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "global" ? (
        <>
          {optedIn ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <span className="font-semibold">Your score is shared and kept up to date.</span>
              <button onClick={leave} disabled={busy} className="inline-flex items-center gap-1.5 text-xs font-bold underline decoration-dotted">
                <LogOut aria-hidden className="h-3.5 w-3.5" />
                Leave
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold">Compete with everyone using this server</p>
              <p className="mt-1 text-sm text-slate-500">
                Joining shares your first name and your score with the server. You can leave any time and your score is
                deleted.
              </p>
              <button
                onClick={join}
                disabled={busy || !session}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                <Share2 aria-hidden className="h-4 w-4" />
                {busy ? "Joining..." : "Join the global leaderboard"}
              </button>
            </div>
          )}

          {failed && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              Couldn&apos;t load the global board. Is the server running?
            </p>
          )}
          {data && data.rows.length === 0 && !failed && (
            <p className="py-8 text-center text-sm font-medium text-slate-500">Nobody has joined yet. Be the first.</p>
          )}
          {data && data.rows.length > 0 && (
            <>
              <ol className="space-y-2">
                {data.rows.map((r) => (
                  <Row key={r.rank} {...r} />
                ))}
              </ol>
              <p className="text-center text-xs text-slate-400">
                {data.total} {data.total === 1 ? "person" : "people"} ranked. Scores are self-reported by each browser.
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <ol className="space-y-2">
            {local.map((r, n) => (
              <Row key={r.id} rank={n + 1} {...r} you={r.id === session?.id} />
            ))}
          </ol>
          <p className="text-center text-xs text-slate-400">
            Everyone with an account on this browser, ranked from their real saved progress.
          </p>
        </>
      )}
    </div>
  );
}
