import { readBoard, remove, upsert } from "@/lib/leaderboard/store";

export const dynamic = "force-dynamic";

const int = (v: unknown, max: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
};

/** Public ranking. Ids are never returned; pass your own `id` to find your row. */
export async function GET(req: Request) {
  const me = new URL(req.url).searchParams.get("id");
  const all = (await readBoard()).sort((a, b) => b.xp - a.xp || a.updatedAt.localeCompare(b.updatedAt));
  const rows = all.slice(0, 50).map((e, i) => ({
    rank: i + 1,
    name: e.name,
    xp: e.xp,
    steps: e.steps,
    finished: e.finished,
    streak: e.streak,
    you: !!me && e.id === me,
  }));
  const mine = me ? all.findIndex((e) => e.id === me) : -1;
  return Response.json({
    rows,
    total: all.length,
    you: mine >= 0 ? { rank: mine + 1, xp: all[mine].xp } : null,
  });
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof b.id === "string" ? b.id.trim() : "";
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 30) : "";
  if (!/^[\w-]{6,40}$/.test(id) || !name) {
    return Response.json({ error: "id and name are required" }, { status: 400 });
  }
  await upsert({
    id,
    name,
    xp: int(b.xp, 10_000_000),
    steps: int(b.steps, 100_000),
    finished: int(b.finished, 100_000),
    streak: int(b.streak, 36_500),
    updatedAt: new Date().toISOString(),
  });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });
  await remove(id);
  return Response.json({ ok: true });
}
