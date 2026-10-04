import { assessGoal } from "@/lib/ai/assess";
import { parseSkills } from "@/schemas";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as {
    text?: string;
    title?: string;
    skills?: unknown;
    context?: string;
  };
  if (!b.text?.trim()) return Response.json({ error: "text is required" }, { status: 400 });
  return Response.json(
    await assessGoal({
      text: b.text.trim().slice(0, 500),
      title: b.title ?? b.text,
      skills: parseSkills(b.skills),
      context: (b.context ?? "").slice(0, 600),
    }),
  );
}
