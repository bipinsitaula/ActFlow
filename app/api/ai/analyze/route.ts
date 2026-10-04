import { analyzeIntention } from "@/lib/ai/analyze";

export async function POST(req: Request) {
  const { text } = (await req.json().catch(() => ({}))) as { text?: string };
  if (!text?.trim()) return Response.json({ error: "text is required" }, { status: 400 });
  return Response.json(await analyzeIntention(text.trim().slice(0, 500)));
}
