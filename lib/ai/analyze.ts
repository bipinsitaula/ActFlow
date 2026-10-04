import { analyzeFallback, needsSkillCheckFallback } from "./fallback";
import { ollamaJSON } from "./ollama";
import { QUESTIONS } from "@/lib/friction/catalog";
import { parseAnalysis } from "@/schemas";
import type { Analysis } from "@/types";

const SYSTEM = `You are the understanding layer of ActFlow, an app that turns intentions into action.
Given something a user says they want to do, classify what kind of friction is likely stopping them:
- "focus": procrastination; they know what to do but can't start (studying, exercise, writing)
- "coordinate": other people must act (group projects, events)
- "navigate": a bureaucratic or multi-step process (renewals, applications, paperwork)
- "decide": they are unsure whether or what to do
Reply with JSON only: {"title": short clean goal (max 8 words), "mode": one of the four, "deadline": string or null,
"question": a short question asking what is stopping them (for "decide": what are they unsure about),
"needsSkillCheck": true ONLY when success depends on real expertise or the goal is a big career, life or learning goal (becoming something, switching careers, applying for competitive roles, launching a business); false for everyday tasks like cleaning, studying for an exam, paying a bill, exercising or calling someone,
"options": 4 or 5 objects {"label": short first-person reason tailored to THIS goal, "mode": one of the four}}.
Use mode "coordinate" for an option like "I need help from someone".`;

export async function analyzeIntention(text: string): Promise<Analysis> {
  const raw = await ollamaJSON<unknown>(SYSTEM, `Intention: "${text}"`);
  const parsed = parseAnalysis(raw);
  if (!parsed || parsed.options.length < 2) return analyzeFallback(text);
  return {
    ...parsed,
    needsSkillCheck: parsed.needsSkillCheck ?? needsSkillCheckFallback(text),
    question: parsed.question ?? QUESTIONS[parsed.mode],
    source: "ollama",
  };
}
