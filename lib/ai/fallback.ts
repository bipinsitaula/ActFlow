import { DEFAULT_OPTIONS, QUESTIONS } from "@/lib/friction/catalog";
import type { Analysis, Mode, Plan, Resource } from "@/types";

export function detectMode(text: string): Mode {
  const t = text.toLowerCase();
  if (/\b(should i|whether|can't decide|cannot decide|worth it|or not|not sure if)\b/.test(t)) return "decide";
  if (/\b(renew|licen[sc]e|passport|visa|register|registration|tax|insurance|paperwork|form|permit|document)\b/.test(t)) return "navigate";
  if (/\b(we|our|team|group|organi[sz]e|event|everyone|together|colleague)\b/.test(t)) return "coordinate";
  return "focus";
}

export function cleanTitle(text: string) {
  const t = text
    .trim()
    .replace(/^i\s+don'?t\s+know\s+whether\s+(i\s+should\s+)?/i, "Decide whether to ")
    .replace(/^(i|we)\s+(really\s+)?(need|have|want|should|must|ought)\s+to\s+/i, "")
    .replace(/[.!?]+$/, "");
  const out = t.charAt(0).toUpperCase() + t.slice(1);
  return out.length > 60 ? out.slice(0, 57) + "..." : out;
}

/** Big, skill-dependent goals deserve a readiness check. Everyday tasks do not. */
export function needsSkillCheckFallback(text: string) {
  return /(become|career|learn|master|launch|startup|degree|certif|switch (careers|jobs)|get (a|the) job|promotion|run for|write a (book|novel)|build (an?|my) (app|company|business|website)|start (a|my) (business|company|channel)|president|prime minister|surgeon|doctor|pilot|astronaut|olympic|internship|apply (for|to))/i.test(text);
}

export function analyzeFallback(text: string): Analysis {
  const mode = detectMode(text);
  const deadline = text.match(/\b(before|by|until)\s+([^.,;]{2,30})/i)?.[0] ?? null;
  return {
    title: cleanTitle(text),
    mode,
    deadline,
    question: QUESTIONS[mode],
    needsSkillCheck: needsSkillCheckFallback(text),
    options: DEFAULT_OPTIONS[mode],
    source: "fallback",
  };
}

const learn = (q: string): Resource => ({ kind: "learn", title: `Guide: ${q}`, query: `how to ${q}` });
const video = (q: string): Resource => ({ kind: "video", title: `Watch: ${q}`, query: `${q} tutorial` });
const place = (title: string, query: string): Resource => ({ kind: "location", title, query });

function basePlan(title: string, mode: Mode, choice: string): Plan {
  const t = title.charAt(0).toLowerCase() + title.slice(1);
  const short = /time/i.test(choice);

  if (mode === "coordinate") {
    return {
      mode,
      source: "fallback",
      summary: "Get everyone's part defined, then chase whoever is holding things up.",
      steps: [
        {
          title: `Write down exactly what you need from each person for "${t}"`,
          minutes: 5,
          kind: "mental",
          detail: "List every task, who owns it, and when it is needed. One line each.",
          verify: ["Every task has a named owner", "Every task has a due date"],
          resources: [learn("write a clear project brief")],
        },
        {
          title: "Share the brief in your group chat",
          minutes: 3,
          blockedByIndex: 0,
          kind: "digital",
          detail: "Paste the list into the group chat and ask everyone to react to confirm.",
          verify: ["The message is sent", "At least one person confirmed"],
        },
        {
          title: "Teammate sends their part",
          owner: "Teammate",
          minutes: 15,
          blockedByIndex: 1,
          kind: "people",
          detail: "This one is theirs. Nudge them if it has been more than a day.",
          verify: ["I have received it", "It matches what I asked for"],
        },
        {
          title: "Combine everyone's input",
          minutes: 15,
          blockedByIndex: 2,
          kind: "digital",
          detail: "Merge all contributions into one document or plan.",
          verify: ["Everything received is included", "Nothing contradicts anything else"],
          resources: [video("combine group work into one document")],
        },
        {
          title: "Final review and sign-off",
          minutes: 10,
          blockedByIndex: 3,
          kind: "mental",
          detail: "Read it once start to finish and get a quick approval from the group.",
          verify: ["I read it end to end", "The group approved it"],
        },
      ],
    };
  }

  if (mode === "navigate") {
    return {
      mode,
      source: "fallback",
      summary: "One step at a time. You only ever see the one that matters now.",
      steps: [
        {
          title: "Find the official page that explains the process",
          minutes: 5,
          kind: "digital",
          detail: "Search for the official government or provider site, not a third-party agent.",
          verify: ["I am on the official site", "I can see the list of requirements"],
          resources: [learn(t), video(t)],
        },
        {
          title: "Check you're eligible and what it costs",
          minutes: 5,
          kind: "mental",
          detail: "Note the eligibility rules, the fee and how long it takes.",
          verify: ["I meet the eligibility rules", "I know the fee and the timeline"],
        },
        {
          title: "Gather the documents they ask for",
          minutes: 15,
          kind: "physical",
          detail: "Collect originals and make one copy of each. Put them in one folder.",
          verify: ["Every required document is in the folder", "Nothing is expired"],
          resources: [place("Copy / print shop", "photocopy shop near me")],
        },
        {
          title: "Book an appointment or submit the form",
          minutes: 10,
          kind: "digital",
          detail: "Use the official booking page or form and save the confirmation.",
          verify: ["I have a confirmation number or email"],
        },
        {
          title: "Complete the visit or verification",
          minutes: 30,
          kind: "physical",
          detail: "Go to the office on the booked day with your folder and ID.",
          verify: ["My details were verified", "I was given a receipt or reference"],
          resources: [place("Government service office", `${t} office near me`)],
        },
        {
          title: "Collect the result and file a copy",
          minutes: 5,
          kind: "physical",
          detail: "Pick up or download the result and store a scan somewhere safe.",
          verify: ["I have the final document", "A copy is saved"],
        },
      ],
    };
  }

  if (mode === "decide") {
    return {
      mode,
      source: "fallback",
      summary: "Check what you actually know before you decide.",
      decision: {
        unsure: choice,
        criteria: [
          "I understand what's being asked of me",
          "I meet most of the requirements",
          "The time and effort are realistic",
          "The downside of trying is small",
        ],
        recommendation:
          "If most of these check out, take the first step and let the outcome make the final call.",
      },
      steps: [
        {
          title: "Write down what you're unsure about in one sentence",
          minutes: 3,
          kind: "mental",
          detail: "One sentence, starting with: I'm not sure whether...",
          verify: ["It is written down"],
        },
        {
          title: "Look up the real requirements and check them off",
          minutes: 10,
          blockedByIndex: 0,
          kind: "digital",
          detail: "Find the official description and compare it with what you have today.",
          verify: ["I read the full requirements", "I marked what I meet and what I don't"],
          resources: [learn(t)],
        },
        {
          title: "Take the smallest reversible step toward it",
          minutes: 15,
          blockedByIndex: 1,
          kind: "digital",
          detail: "Something you can undo: a draft, a message, a signup you can cancel.",
          verify: ["The step is done", "I can still back out"],
        },
        {
          title: "Review how it felt and make the call",
          minutes: 5,
          blockedByIndex: 2,
          kind: "mental",
          detail: "Ask: did this make me want more, or less?",
          verify: ["I made a call and wrote it down"],
        },
      ],
    };
  }

  return {
    mode,
    source: "fallback",
    summary: "Don't do all of it. Do ten minutes of it.",
    steps: [
      {
        title: `Gather what you need for "${t}"`,
        minutes: 3,
        kind: "physical",
        detail: "Put everything you need in front of you so starting costs nothing.",
        micro: ["Open the materials", "Clear your desk", "Silence your phone"],
        verify: ["Everything I need is within reach", "My phone is away"],
      },
      {
        title: "Pick the single smallest piece to finish first",
        minutes: 3,
        kind: "mental",
        detail: "Choose one page, one problem or one paragraph. Not the whole thing.",
        verify: ["I can name the one piece"],
      },
      {
        title: "Do one focused 10-minute pass",
        minutes: short ? 5 : 10,
        kind: "mental",
        detail: "Work only on that piece until the timer ends.",
        micro: ["Set a timer", "Work on only that piece", "Stop when it rings"],
        verify: ["I worked the full time without switching tasks", "I have something to show for it"],
        resources: [video(t), learn(t)],
      },
      {
        title: "Note what's left and what comes next",
        minutes: 5,
        kind: "mental",
        detail: "Write the next piece on a sticky note so tomorrow starts instantly.",
        verify: ["The next piece is written down"],
      },
      {
        title: "Do a second, longer session",
        minutes: short ? 10 : 20,
        kind: "mental",
        detail: "Same rules as before, but a little longer.",
        verify: ["I finished the session", "I can say what I got done"],
      },
    ],
  };
}

/** Adds a first step that closes the user's biggest skill gap, shifting later dependencies down by one. */
export function planFallback(title: string, mode: Mode, choice: string, gaps: string[] = []): Plan {
  const plan = basePlan(title, mode, choice);
  const gap = gaps[0];
  if (!gap || mode === "decide") return plan;
  const prep: Plan["steps"][number] = {
    title: `Close your biggest gap: ${gap}`,
    minutes: 60,
    kind: "digital",
    detail: "Spend a first focused hour learning the basics. Change the time if this needs days or weeks.",
    verify: ["I can explain the basics in my own words"],
    resources: [learn(gap), video(gap)],
  };
  return {
    ...plan,
    steps: [prep, ...plan.steps.map((s) => ({ ...s, blockedByIndex: s.blockedByIndex === undefined ? undefined : s.blockedByIndex + 1 }))],
  };
}
