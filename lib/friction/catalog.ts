import type { FrictionOption, Mode } from "@/types";

export const MODES: Record<
  Mode,
  { label: string; friction: string; tone: string; blurb: string }
> = {
  focus: {
    label: "Focus",
    friction: "Procrastination",
    tone: "text-indigo-700 bg-indigo-50 ring-indigo-200",
    blurb: "You know what to do. Let's make starting tiny.",
  },
  coordinate: {
    label: "Coordinate",
    friction: "Coordination",
    tone: "text-amber-700 bg-amber-50 ring-amber-200",
    blurb: "Someone else is part of this. Let's find who's holding it up.",
  },
  navigate: {
    label: "Navigate",
    friction: "Life admin",
    tone: "text-emerald-700 bg-emerald-50 ring-emerald-200",
    blurb: "Too many steps. We'll show only the one that matters now.",
  },
  decide: {
    label: "Decide",
    friction: "Indecision",
    tone: "text-violet-700 bg-violet-50 ring-violet-200",
    blurb: "Let's turn the decision into a small experiment.",
  },
};

export const QUESTIONS: Record<Mode, string> = {
  focus: "What's stopping you?",
  coordinate: "What's getting in the way?",
  navigate: "What's the hard part?",
  decide: "What are you unsure about?",
};

export const DEFAULT_OPTIONS: Record<Mode, FrictionOption[]> = {
  focus: [
    { label: "I don't know where to start", mode: "focus" },
    { label: "It's too much", mode: "focus" },
    { label: "I don't have enough time", mode: "focus" },
    { label: "I keep procrastinating", mode: "focus" },
    { label: "I need help from someone", mode: "coordinate" },
  ],
  coordinate: [
    { label: "I'm waiting on someone", mode: "coordinate" },
    { label: "Nobody knows who owns what", mode: "coordinate" },
    { label: "Too many people to keep track of", mode: "coordinate" },
    { label: "I can do it alone, I just can't start", mode: "focus" },
  ],
  navigate: [
    { label: "I don't understand the process", mode: "navigate" },
    { label: "There are too many steps", mode: "navigate" },
    { label: "I don't know what documents I need", mode: "navigate" },
    { label: "I keep putting it off", mode: "focus" },
  ],
  decide: [
    { label: "Am I qualified?", mode: "decide" },
    { label: "Is it worth my time?", mode: "decide" },
    { label: "Will I enjoy it?", mode: "decide" },
    { label: "I don't know enough about it", mode: "decide" },
  ],
};

export const EXAMPLES = [
  "I need to prepare for my physics exam",
  "We need to organize our college event",
  "I need to renew my driving license before my trip",
  "I don't know whether I should apply for this internship",
];
