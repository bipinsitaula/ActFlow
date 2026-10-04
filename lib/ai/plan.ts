import { planFallback } from "./fallback";
import { ollamaJSON } from "./ollama";
import { parsePlan } from "@/schemas";
import type { Mode, Plan, SkillInput } from "@/types";

const SYSTEM = `You are the planning layer of ActFlow. Produce the SMALLEST useful path from intention to done.
Reply with JSON only. The "steps" array MUST contain 4 to 7 steps covering the WHOLE path from start to done, not just the first step.
{"mode": "focus"|"coordinate"|"navigate"|"decide",
 "summary": one encouraging sentence,
 "steps": 4 to 7 objects {"title": concrete action starting with a verb, "minutes": integer estimate of the real time needed, in minutes (use big numbers when it is big: 1440 is a day, 525600 is a year),
   "owner": name/role of ANOTHER person if someone else must do it (omit if the user does it),
   "blockedByIndex": zero-based index of an EARLIER step that must finish first (omit if none),
   "micro": optional 2-3 tiny sub-actions,
   "kind": "physical" (go somewhere / do something in the real world), "digital" (on a computer or phone), "people" (waiting on or talking to someone) or "mental" (thinking, studying, deciding),
   "detail": 1-2 sentences saying exactly how to do this step,
   "verify": 1 to 3 short checks the user can confirm to prove the step is really done (e.g. "I have the confirmation email"),
   "resources": 0 to 3 objects {"kind": "location"|"learn"|"video"|"link", "title": short label, "query": a SEARCH PHRASE (for location: the kind of place plus city if known, e.g. "regional transport office near me"; for learn/video: what to search to learn it). Never invent URLs.}},
 "decision": only for mode "decide": {"unsure": what they are unsure about, "criteria": 3 to 5 yes/no things to check before deciding, "recommendation": one sentence of what to do if most are yes}}
Rules by mode:
- focus: the FIRST step must be doable in 10 minutes or less and name something specific (pages, a formula, a question).
- coordinate: put every dependency on another person in a step with an "owner" and use blockedByIndex.
- physical steps should have a "location" resource; digital steps that need learning should have "learn" or "video" resources.
- navigate: order the real-world process steps; the first should be the cheapest to start.
- If known gaps are listed, the first step(s) must close the biggest gap, and the minutes should honestly reflect how long learning it takes (days, weeks or years are fine).
- decide: steps form a small experiment, not a yes/no answer.`;

export async function planIntention(input: {
  text: string;
  title: string;
  mode: Mode;
  choice: string;
  deadline?: string | null;
  skills?: SkillInput[];
  gaps?: string[];
}): Promise<Plan> {
  const skills = input.skills?.length ? input.skills.map((s) => `${s.name} (${s.level})`).join(", ") : "not shared";
  const gaps = input.gaps?.length ? input.gaps.join("; ") : "none identified";
  const user = `Intention: "${input.text}"
Mode: ${input.mode}
What is in the way: "${input.choice}"
Deadline: ${input.deadline ?? "none"}
The person's skills: ${skills}
Known gaps to close first: ${gaps}`;

  // Small local models sometimes return only the first step. Ask once more, firmly, before giving up.
  let parsed: ReturnType<typeof parsePlan> = null;
  const retryHint = "\nYour previous answer had too few steps. Return the complete path with 4 to 7 steps in the steps array.";
  for (const hint of ["", retryHint]) {
    const raw = await ollamaJSON<unknown>(SYSTEM, user + hint);
    parsed = parsePlan(raw, input.mode);
    if (parsed) break;
    console.warn("[ai] plan rejected. Model said:", JSON.stringify(raw)?.slice(0, 500));
    if (raw === null) break; // Ollama unreachable: retrying won't help
  }
  if (!parsed) return planFallback(input.title, input.mode, input.choice, input.gaps);
  return { ...parsed, mode: input.mode, source: "ollama" };
}
