"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIntentions } from "@/hooks/useIntentions";
import { pushScore, statsOf, useGlobalOptIn } from "@/lib/leaderboard/client";

/** Keeps your global leaderboard score current while you are opted in. Renders nothing. */
export function LeaderboardSync() {
  const { session } = useAuth();
  const { intentions } = useIntentions();
  const [optedIn] = useGlobalOptIn(session?.id);
  const stats = useMemo(() => (intentions ? statsOf(intentions) : null), [intentions]);
  const key = stats ? `${stats.xp}-${stats.steps}-${stats.finished}-${stats.streak}` : "";

  useEffect(() => {
    if (!optedIn || !session || !stats) return;
    const t = setTimeout(() => {
      pushScore(session.id, session.name, stats).catch(() => {
        // offline or server down: the next change will retry
      });
    }, 800);
    return () => clearTimeout(t);
    // `key` captures every value of `stats` that matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optedIn, session?.id, session?.name, key]);

  return null;
}
