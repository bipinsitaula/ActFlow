"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FrictionSelector } from "@/components/friction/FrictionSelector";
import { AssessmentCard } from "@/components/intention/AssessmentCard";
import { IntentionBox } from "@/components/intention/IntentionBox";
import { SkillsForm } from "@/components/intention/SkillsForm";
import { useToast } from "@/components/ui/Toast";
import { useIntentions } from "@/hooks/useIntentions";
import type { Analysis, Assessment, FrictionOption, Plan, SkillInput } from "@/types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
  return (await res.json()) as T;
}

type Stage = "intent" | "skills" | "verdict" | "friction";

export default function CreatePage() {
  const router = useRouter();
  const { add } = useIntentions();
  const toast = useToast();
  const [stage, setStage] = useState<Stage>("intent");
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [context, setContext] = useState("");
  const [assessment, setAssessment] = useState<Assessment | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(fn: () => Promise<T>, fail: string): Promise<T | undefined> {
    setError(null);
    setBusy(true);
    try {
      return await fn();
    } catch {
      setError(fail);
      toast(fail, "error");
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    const a = await run(() => post<Analysis>("/api/ai/analyze", { text }), "Something went wrong understanding that. Try again.");
    if (a) {
      setAnalysis(a);
      setAssessment(undefined);
      // Everyday tasks skip the skills questions entirely.
      setStage(a.needsSkillCheck ? "skills" : "friction");
    }
  }

  async function assess(goalText: string, goalTitle: string, s: SkillInput[], c: string) {
    const a = await run(
      () => post<Assessment>("/api/ai/assess", { text: goalText, title: goalTitle, skills: s, context: c }),
      "Couldn't run the check. Try again, or skip it.",
    );
    if (a) {
      setAssessment(a);
      setStage("verdict");
      if (a.verdict === "go") toast("Skill check done: you're ready to go.", "success");
      else if (a.verdict === "prepare") toast("Skill check done: some preparation needed.", "warning");
      else toast("Skill check done: this may not be the right goal for now.", "error");
    }
  }

  async function takeAlternative(goal: string) {
    setText(goal);
    const a = await run(() => post<Analysis>("/api/ai/analyze", { text: goal }), "Couldn't switch goals. Try again.");
    if (a) {
      setAnalysis(a);
      await assess(goal, a.title, skills, context);
    }
  }

  async function build(option: FrictionOption | null, comment: string) {
    if (!analysis) return;
    const choice = option ? (comment ? `${option.label}. Also: ${comment}` : option.label) : comment;
    const mode = option?.mode ?? analysis.mode;
    const plan = await run(
      () =>
        post<Plan>("/api/ai/plan", {
          text,
          title: analysis.title,
          mode,
          choice,
          deadline: analysis.deadline,
          skills,
          gaps: assessment?.gaps ?? [],
        }),
      "Couldn't build your plan. Try again.",
    );
    if (!plan) return;
    const id = add({
      text,
      title: analysis.title,
      choice,
      deadline: analysis.deadline,
      plan,
      skills: skills.length ? skills : undefined,
      assessment,
      comment,
    });
    toast("Intention created. It's now pending.", "success");
    if (plan.source === "fallback") toast("AI was offline, so a built-in template plan was used.", "warning");
    router.push(`/intention/${id}`);
  }

  const back = () => {
    if (stage === "friction") setStage(assessment ? "verdict" : "skills");
    else if (stage === "verdict") setStage("skills");
    else setStage("intent");
    setError(null);
  };

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6 flex items-center gap-4">
        {stage === "intent" ? (
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
          >
            <ArrowLeft aria-hidden className="h-5 w-5" />
          </Link>
        ) : (
          <button
            onClick={back}
            disabled={busy}
            aria-label="Go back"
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
          >
            <ArrowLeft aria-hidden className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl font-bold">New Intention</h1>
      </header>

      {stage !== "intent" && (
        <p className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 text-[15px]">&ldquo;{text}&rdquo;</p>
      )}

      {stage === "intent" && <IntentionBox value={text} onChange={setText} onSubmit={analyze} busy={busy} />}

      {stage === "skills" && analysis && (
        <SkillsForm
          title={analysis.title}
          initialSkills={skills}
          initialContext={context}
          busy={busy}
          onSkip={() => {
            setAssessment(undefined);
            setStage("friction");
          }}
          onSubmit={(s, c) => {
            setSkills(s);
            setContext(c);
            void assess(text, analysis.title, s, c);
          }}
        />
      )}

      {stage === "verdict" && assessment && (
        <AssessmentCard
          assessment={assessment}
          busy={busy}
          onContinue={() => setStage("friction")}
          onAlternative={takeAlternative}
          onStop={() => router.push("/dashboard")}
        />
      )}

      {stage === "friction" && analysis && (
        <>
          <FrictionSelector analysis={analysis} busy={busy} onSubmit={build} />
          {!assessment && (
            <button
              onClick={() => setStage("skills")}
              disabled={busy}
              className="mt-4 text-sm font-medium text-slate-500 underline decoration-dotted hover:text-slate-800"
            >
              Check my skills for this goal first
            </button>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
