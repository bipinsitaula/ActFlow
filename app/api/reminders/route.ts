import { ollamaJSON } from "@/lib/ai/ollama";

/** Drafts a short, friendly nudge. The client decides how to send it (copy, WhatsApp, email). */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as {
    owner?: string;
    task?: string;
    project?: string;
    blocking?: number;
  };
  if (!b.owner || !b.task) {
    return Response.json({ error: "owner and task are required" }, { status: 400 });
  }

  const fallback = `Hi ${b.owner}, quick nudge on "${b.task}"${b.project ? ` for ${b.project}` : ""}.${
    b.blocking ? ` It's blocking ${b.blocking} other task${b.blocking > 1 ? "s" : ""}.` : ""
  } Could you send it over today? Thanks!`;

  const ai = await ollamaJSON<{ message?: string }>(
    'Write one friendly, brief reminder message (max 45 words). Reply as JSON: {"message": string}.',
    `To: ${b.owner}. Task they owe: "${b.task}". Project: ${b.project ?? "n/a"}. Tasks blocked by it: ${b.blocking ?? 0}.`,
  );
  const aiMessage = typeof ai?.message === "string" ? ai.message.trim() : "";
  return Response.json({
    message: aiMessage || fallback,
    source: aiMessage ? "ollama" : "fallback",
  });
}
