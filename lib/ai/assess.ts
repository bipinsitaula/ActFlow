import { ollamaJSON } from "./ollama";
import { parseAssessment } from "@/schemas";
import type { Assessment, Level, SkillInput } from "@/types";

const SYSTEM = `You are an honest, kind reality-check advisor inside ActFlow, an app that helps people act on goals.
Judge how ready the person is for their goal RIGHT NOW, given the skills and context they shared, and whether the goal is realistic for them.
Verdicts:
- "go": they have what it takes to start now.
- "prepare": realistic, but they have specific gaps to close first.
- "reconsider": very unlikely or a poor fit given their situation. Be honest, never insulting, and suggest more realistic goals that use their strengths.
Be specific, not generic. Do not invent facts about the person. If they listed no relevant skills, say what is unknown and choose "prepare" or "reconsider" accordingly.
Reply with JSON only: {"verdict": "go"|"prepare"|"reconsider", "score": 0-100 readiness, "summary": 2 sentences, "strengths": 0-4 short strings, "gaps": 0-5 short strings (the real things missing), "alternatives": 0-3 realistic goals (required when verdict is "reconsider", optional when "prepare"), "advice": one sentence on the best next move}.`;

const WEIGHT: Record<Level, number> = { none: 0, beginner: 1, intermediate: 2, advanced: 3 };

interface Barrier {
  match: RegExp;
  keywords: string[];
  gaps: string[];
  alternatives: string[];
}

/** A few goals with famously high entry barriers, so the built-in check can still say something useful. */
const BARRIERS: Barrier[] = [
  {
    match: /\b(president|prime minister|senator|mayor|politician|member of parliament|governor)\b/i,
    keywords: ["politic", "law", "public speaking", "campaign", "policy", "govern", "debate", "leadership", "organi"],
    gaps: [
      "Political experience (party work, local office or campaigning)",
      "A public profile and a base of supporters",
      "Policy, law and governance knowledge",
      "Fundraising and campaign organisation",
    ],
    alternatives: [
      "Join a local party or civic group and take a role",
      "Volunteer on a local campaign",
      "Run for a community, student or local council seat",
      "Work in policy, advocacy or public administration",
    ],
  },
  {
    match: /\b(surgeon|doctor|physician)\b/i,
    keywords: ["biolog", "chem", "medic", "anatom", "health", "science"],
    gaps: ["A medical degree and licensing (many years)", "A strong science foundation", "Entrance exam preparation"],
    alternatives: ["Nursing or allied health", "Health technology or medical lab work", "Public health"],
  },
  {
    match: /\b(astronaut|fighter pilot|airline pilot)\b/i,
    keywords: ["aviation", "pilot", "engineer", "physics", "flight"],
    gaps: ["Aviation or engineering qualifications", "Flight hours and medical clearance", "Very competitive selection"],
    alternatives: ["Aerospace engineering", "Drone piloting or air traffic roles", "Private pilot licence as a first step"],
  },
  {
    match: /\b(olympic|professional athlete|world champion)\b/i,
    keywords: ["sport", "athlet", "training", "coach", "fitness"],
    gaps: ["Years of structured elite training", "Competition results at a national level", "A coach and support team"],
    alternatives: ["Compete locally and build a record", "Coaching or sports science", "Join a club or league"],
  },
];

export function assessFallback(title: string, skills: SkillInput[]): Assessment {
  const note = "The built-in check can't judge every field. Start Ollama for a deeper assessment.";
  const strengths = skills.filter((s) => WEIGHT[s.level] >= 2).map((s) => `${s.name} (${s.level})`).slice(0, 4);
  const barrier = BARRIERS.find((b) => b.match.test(title));

  if (barrier) {
    const matched = skills.filter(
      (s) => WEIGHT[s.level] >= 2 && barrier.keywords.some((k) => s.name.toLowerCase().includes(k)),
    );
    if (matched.length >= 2) {
      return {
        verdict: "prepare",
        score: 40,
        summary: "You have some of the right foundations, but this goal has a high bar and a long road.",
        strengths: matched.map((s) => `${s.name} (${s.level})`),
        gaps: barrier.gaps,
        alternatives: barrier.alternatives.slice(0, 2),
        advice: "Treat this as a multi-year path and start with the first rung, not the final goal.",
        source: "fallback",
      };
    }
    return {
      verdict: "reconsider",
      score: 8,
      summary: "Based on what you've told me, you don't yet have the background this goal normally requires, and it has a very high bar.",
      strengths,
      gaps: barrier.gaps,
      alternatives: barrier.alternatives,
      advice: "Pick a nearer goal on the same road, build real experience there, and revisit this one later.",
      source: "fallback",
    };
  }

  if (!skills.length) {
    return {
      verdict: "prepare",
      score: 30,
      summary: `You haven't listed any skills for this goal, so I can't tell how ready you are. ${note}`,
      strengths: [],
      gaps: [],
      alternatives: [],
      advice: "Go back and list what you already know, even if it is only a little.",
      source: "fallback",
    };
  }

  const avg = skills.reduce((n, s) => n + WEIGHT[s.level], 0) / skills.length;
  if (avg >= 2.5) {
    return { verdict: "go", score: 80, summary: `Your skills look strong for this. ${note}`, strengths, gaps: [], alternatives: [], advice: "Start now and adjust as you learn.", source: "fallback" };
  }
  return {
    verdict: "prepare",
    score: avg >= 1.5 ? 60 : 40,
    summary: `Your listed skills are mostly at beginner level, so expect a learning curve. I can't tell which skills this particular goal needs, so treat this as a rough guide. ${note}`,
    strengths,
    gaps: [],
    alternatives: [],
    advice: "Start with the smallest step and learn as you go.",
    source: "fallback",
  };
}

export async function assessGoal(input: {
  text: string;
  title: string;
  skills: SkillInput[];
  context: string;
}): Promise<Assessment> {
  const skillLines = input.skills.length
    ? input.skills.map((s) => `- ${s.name}: ${s.level}`).join("\n")
    : "(none listed)";
  const raw = await ollamaJSON<unknown>(
    SYSTEM,
    `Goal: "${input.text}"\nSkills the person listed:\n${skillLines}\nAbout them: ${input.context || "(nothing shared)"}`,
  );
  const parsed = parseAssessment(raw);
  if (!parsed) return assessFallback(input.text, input.skills);
  return { ...parsed, source: "ollama" };
}
