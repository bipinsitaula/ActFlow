"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { NextActionCard } from "@/components/action/NextActionCard";
import { BlockerCard } from "@/components/friction/BlockerCard";
import { AssessmentCard } from "@/components/intention/AssessmentCard";
import { CommentThread } from "@/components/intention/CommentThread";
import { DecisionPanel } from "@/components/intention/DecisionPanel";
import { FlowDiagram } from "@/components/intention/FlowDiagram";
import { StepPanel } from "@/components/intention/StepPanel";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ModeBadge } from "@/components/ui/ModeBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { useIntentions } from "@/hooks/useIntentions";
import { formatDuration } from "@/lib/utils/time";
import { blockersOf, decisionPending, isComplete, nextStep, progress } from "@/lib/actions/next";

export default function IntentionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { intentions, toggleStep, completeStep, toggleCriterion, decide, logReminder, setStepDuration, addComment, deleteComment, remove } =
    useIntentions();
  const [picked, setPicked] = useState<string>();

  if (!intentions) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-busy />;
  const intention = intentions.find((i) => i.id === id);
  if (!intention) {
    return (
      <Card>
        <p className="font-semibold">That intention doesn&apos;t exist.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-indigo-600 underline">
          Back to dashboard
        </Link>
      </Card>
    );
  }

  const step = nextStep(intention);
  const blockers = blockersOf(intention).filter((b) => b.blocked.length > 0);
  const done = isComplete(intention);
  const pending = decisionPending(intention);
  const passed = intention.decision?.decided === "pass";

  const selected =
    intention.steps.find((s) => s.id === picked) ??
    step ??
    intention.steps.find((s) => !s.done) ??
    intention.steps[0];

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Dashboard
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={intention.mode} />
          {intention.deadline && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <Clock aria-hidden className="h-3 w-3" />
              {intention.deadline}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{intention.title}</h1>
        {intention.summary && <p className="mt-2 text-sm text-slate-500">{intention.summary}</p>}
        {(() => {
          const left = intention.steps.filter((s) => !s.done).reduce((n, s) => n + (s.minutes ?? 0), 0);
          return left > 0 ? (
            <p className="mt-3 text-xs font-semibold text-slate-500">About {formatDuration(left)} of work left</p>
          ) : null;
        })()}
        <div className="mt-3">
          <ProgressBar value={progress(intention)} tone={done ? "bg-emerald-500" : "bg-indigo-600"} />
        </div>
      </header>

      {done && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Done. Every step verified.</p>
            {intention.focusMinutes > 0 && (
              <p className="mt-0.5 text-sm">{intention.focusMinutes} focused minutes along the way.</p>
            )}
          </div>
        </div>
      )}

      {intention.assessment && intention.assessment.verdict !== "go" && (
        <AssessmentCard assessment={intention.assessment} />
      )}

      {pending && (
        <DecisionPanel
          intention={intention}
          onToggle={(cid) => toggleCriterion(intention.id, cid)}
          onDecide={(v) => {
            decide(intention.id, v);
            toast(v === "go" ? "Decision made: go for it." : "Decision made: you passed on this.", v === "go" ? "success" : "warning");
          }}
        />
      )}

      {!done && step && <NextActionCard intention={intention} step={step} />}

      {blockers.map((b) => (
        <BlockerCard key={b.step.id} blocker={b} onReminded={logReminder} />
      ))}

      {intention.decision && !pending && (
        <DecisionPanel
          intention={intention}
          onToggle={(cid) => toggleCriterion(intention.id, cid)}
          onDecide={(v) => {
            decide(intention.id, v);
            toast(v === "go" ? "Decision made: go for it." : "Decision made: you passed on this.", v === "go" ? "success" : "warning");
          }}
        />
      )}

      {!passed && !pending && (
        <div className="space-y-5 desktop:md:grid desktop:md:grid-cols-2 desktop:md:items-start desktop:md:gap-6 desktop:md:space-y-0">
          <section>
            <Eyebrow className="mb-3">Task diagram</Eyebrow>
            <FlowDiagram
              intention={intention}
              currentId={step?.id}
              selectedId={selected?.id}
              onSelect={setPicked}
            />
          </section>

          {selected && (
            <div className="desktop:md:sticky desktop:md:top-20">
            <StepPanel
              key={selected.id}
              intention={intention}
              step={selected}
              currentId={step?.id}
              onComplete={() => {
                completeStep(intention.id, selected.id);
                setPicked(undefined);
                const finished = intention.steps.every((s) => s.id === selected.id || s.done);
                toast(finished ? "Intention completed. Every step verified." : "Step verified.", "success");
              }}
              onReopen={() => {
                toggleStep(intention.id, selected.id);
                toast("Step reopened.", "warning");
              }}
              onDuration={(m) => {
                setStepDuration(intention.id, selected.id, m);
                toast(`Time set to ${formatDuration(m)}.`, "info");
              }}
            />
            </div>
          )}
        </div>
      )}

      <CommentThread
        comments={intention.comments ?? []}
        onAdd={(t) => {
          addComment(intention.id, t);
          toast("Comment added.", "success");
        }}
        onDelete={(cid) => {
          deleteComment(intention.id, cid);
          toast("Comment deleted.", "warning");
        }}
      />

      <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>{intention.source === "ollama" ? "Planned by local AI (Ollama)" : "Planned by built-in templates"}</span>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
          onClick={() => {
            if (window.confirm("Delete this intention?")) {
              remove(intention.id);
              toast("Intention deleted.", "warning");
              router.push("/dashboard");
            }
          }}
        >
          <Trash2 aria-hidden className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
