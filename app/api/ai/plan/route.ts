import { planIntention } from "@/lib/ai/plan";
import { asMode, parseSkills } from "@/schemas";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string | null> & { skills?: unknown; gaps?: unknown };
  const mode = asMode(b.mode);
  if (!b.text?.trim() || !b.title || !mode) {
    return Response.json({ error: "text, title and mode are required" }, { status: 400 });
  }
  return Response.json(
    await planIntention({
      text: b.text.slice(0, 500),
      title: b.title,
      mode,
      choice: b.choice ?? "",
      deadline: b.deadline,
      skills: parseSkills(b.skills),
      gaps: Array.isArray(b.gaps) ? b.gaps.filter((g): g is string => typeof g === "string").slice(0, 5) : [],
    }),
  );
}
