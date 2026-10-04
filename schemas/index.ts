import type { Assessment, FrictionOption, Level, Mode, Plan, PlanStep, Resource, SkillInput, StepKind } from "@/types";

import { MAX_MINUTES } from "@/lib/utils/time";

export const MODE_LIST: Mode[] = ["focus", "coordinate", "navigate", "decide"];

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const str = (v: unknown, max = 140) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

export function asMode(v: unknown): Mode | undefined {
  return MODE_LIST.find((m) => m === v);
}

const KINDS: StepKind[] = ["physical", "digital", "people", "mental"];
const RES_KINDS: Resource["kind"][] = ["location", "learn", "video", "link"];

function strList(v: unknown, max: number): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.map((x) => str(x, 120)).filter((x): x is string => !!x).slice(0, max);
  return out.length ? out : undefined;
}

function parseResources(v: unknown): Resource[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.flatMap((r): Resource[] => {
    if (!isObj(r)) return [];
    const kind = RES_KINDS.find((k) => k === r.kind);
    const title = str(r.title, 80);
    const query = str(r.query, 160);
    return kind && title && query ? [{ kind, title, query, note: str(r.note, 120) }] : [];
  });
  return out.length ? out.slice(0, 4) : undefined;
}

export function parseAnalysis(raw: unknown) {
  if (!isObj(raw)) return null;
  const mode = asMode(raw.mode);
  const title = str(raw.title, 70);
  if (!mode || !title) return null;
  const options: FrictionOption[] = Array.isArray(raw.options)
    ? raw.options.flatMap((o) => {
        const label = isObj(o) ? str(o.label, 70) : str(o, 70);
        if (!label) return [];
        return [{ label, mode: (isObj(o) && asMode(o.mode)) || mode }];
      })
    : [];
  return {
    mode,
    title,
    deadline: str(raw.deadline, 50) ?? null,
    question: str(raw.question, 80),
    needsSkillCheck: typeof raw.needsSkillCheck === "boolean" ? raw.needsSkillCheck : undefined,
    options: options.slice(0, 5),
  };
}

export function parsePlan(raw: unknown, fallbackMode: Mode): Omit<Plan, "source"> | null {
  if (!isObj(raw) || !Array.isArray(raw.steps)) return null;
  const steps: PlanStep[] = raw.steps.flatMap((s) => {
    if (!isObj(s)) return [];
    const title = str(s.title, 120);
    if (!title) return [];
    const minutes = Number(s.minutes);
    const blocked = Number(s.blockedByIndex);
    return [
      {
        title,
        minutes: Number.isFinite(minutes) && minutes > 0 ? Math.min(Math.round(minutes), MAX_MINUTES) : undefined,
        owner: str(s.owner, 40),
        blockedByIndex: Number.isInteger(blocked) && blocked >= 0 ? blocked : undefined,
        kind: KINDS.find((k) => k === s.kind),
        detail: str(s.detail, 240),
        verify: strList(s.verify, 4),
        resources: parseResources(s.resources),
        micro: Array.isArray(s.micro)
          ? s.micro.map((m) => str(m, 100)).filter((m): m is string => !!m).slice(0, 4)
          : undefined,
      },
    ];
  });
  if (steps.length < 2) return null;
  steps.forEach((s, i) => {
    // a step can only wait on an earlier step
    if (s.blockedByIndex !== undefined && s.blockedByIndex >= i) s.blockedByIndex = undefined;
    if (s.owner && /^(me|myself|you|i)$/i.test(s.owner)) s.owner = undefined;
  });

  const mode = asMode(raw.mode) ?? fallbackMode;
  let decision: Plan["decision"];
  if (isObj(raw.decision)) {
    const criteria = Array.isArray(raw.decision.criteria)
      ? raw.decision.criteria.map((c) => str(c, 100)).filter((c): c is string => !!c).slice(0, 6)
      : [];
    if (criteria.length) {
      decision = {
        unsure: str(raw.decision.unsure, 80) ?? "this decision",
        criteria,
        recommendation:
          str(raw.decision.recommendation, 200) ??
          "If most of these check out, take the first step and learn as you go.",
      };
    }
  }
  return {
    mode,
    summary: str(raw.summary, 200) ?? "",
    steps: steps.slice(0, 8),
    decision,
  };
}

const LEVELS: Level[] = ["none", "beginner", "intermediate", "advanced"];
export const asLevel = (v: unknown): Level => LEVELS.find((l) => l === v) ?? "beginner";

export function parseSkills(raw: unknown): SkillInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .flatMap((s): SkillInput[] => {
      if (!isObj(s)) return [];
      const name = str(s.name, 60);
      return name ? [{ name, level: asLevel(s.level) }] : [];
    })
    .slice(0, 12);
}

export function parseAssessment(raw: unknown): Omit<Assessment, "source"> | null {
  if (!isObj(raw)) return null;
  const verdict = (["go", "prepare", "reconsider"] as const).find((v) => v === raw.verdict);
  const summary = str(raw.summary, 400);
  if (!verdict || !summary) return null;
  const score = Number(raw.score);
  return {
    verdict,
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 50,
    summary,
    strengths: strList(raw.strengths, 4) ?? [],
    gaps: strList(raw.gaps, 5) ?? [],
    alternatives: strList(raw.alternatives, 3) ?? [],
    advice: str(raw.advice, 240) ?? "",
  };
}
