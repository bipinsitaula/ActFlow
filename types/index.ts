export type Mode = "focus" | "coordinate" | "navigate" | "decide";

export type StepKind = "physical" | "digital" | "people" | "mental";

/** Where to go or what to read. `query` is a search phrase (or an https URL for kind "link"). */
export interface Resource {
  kind: "location" | "learn" | "video" | "link";
  title: string;
  query: string;
  note?: string;
}

export interface Step {
  id: string;
  title: string;
  minutes?: number;
  done: boolean;
  doneAt?: string;
  /** Compressed JPEG data URL, optional proof of completion. */
  proof?: string;
  /** Someone other than the user. Undefined means "me". */
  owner?: string;
  /** Id of a step that must be done before this one can start. */
  blockedBy?: string;
  /** Tiny sub-actions shown inside a focus session. */
  micro?: string[];
  kind?: StepKind;
  /** What to actually do, in a sentence or two. */
  detail?: string;
  /** Things the user must confirm before the step counts as done. */
  verify?: string[];
  resources?: Resource[];
}

export interface Criterion {
  id: string;
  label: string;
  met: boolean;
}

export interface Decision {
  unsure: string;
  criteria: Criterion[];
  recommendation: string;
  decided?: "go" | "pass";
}

export type Level = "none" | "beginner" | "intermediate" | "advanced";

export interface SkillInput {
  name: string;
  level: Level;
}

export interface Assessment {
  verdict: "go" | "prepare" | "reconsider";
  /** 0-100 estimate of how ready the user is for this goal right now. */
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  /** More realistic goals worth considering instead. */
  alternatives: string[];
  advice: string;
  source: AiSource;
}

export interface Comment {
  id: string;
  text: string;
  at: string;
}

export interface Intention {
  skills?: SkillInput[];
  assessment?: Assessment;
  comments?: Comment[];
  id: string;
  text: string;
  title: string;
  mode: Mode;
  choice: string;
  deadline?: string;
  summary: string;
  steps: Step[];
  decision?: Decision;
  focusMinutes: number;
  reminders: { stepId: string; owner: string; at: string }[];
  source: AiSource;
  createdAt: string;
  updatedAt: string;
}

export type AiSource = "ollama" | "fallback";

export interface FrictionOption {
  label: string;
  mode: Mode;
}

export interface Analysis {
  title: string;
  mode: Mode;
  deadline: string | null;
  question: string;
  /** False for everyday tasks, where asking about skills would just be friction. */
  needsSkillCheck: boolean;
  options: FrictionOption[];
  source: AiSource;
}

export interface PlanStep {
  title: string;
  minutes?: number;
  owner?: string;
  blockedByIndex?: number;
  micro?: string[];
  kind?: StepKind;
  detail?: string;
  verify?: string[];
  resources?: Resource[];
}

export interface Plan {
  mode: Mode;
  summary: string;
  steps: PlanStep[];
  decision?: { unsure: string; criteria: string[]; recommendation: string };
  source: AiSource;
}
