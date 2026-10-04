import { ArrowDown, ArrowRight, Timer } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { ModeBadge } from "@/components/ui/ModeBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { progress } from "@/lib/actions/next";
import { MAX_SPRINT, formatDuration, sprintMinutes } from "@/lib/utils/time";
import type { Intention, Step } from "@/types";

export function NextActionCard({
  intention,
  step,
  label = "Next best action",
}: {
  intention: Intention;
  step: Step;
  label?: string;
}) {
  return (
    <section className="rise rounded-3xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-200">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow className="!text-indigo-100">{label}</Eyebrow>
        <ModeBadge mode={intention.mode} className="!bg-white/10 !text-white !ring-white/20" />
      </div>
      <p className="mt-5 text-sm text-indigo-100">{intention.title}</p>
      <h2 className="mt-1 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{step.title}</h2>
      {step.micro && (
        <ul className="mt-4 space-y-1.5 text-sm text-indigo-50">
          {step.micro.map((m) => (
            <li key={m} className="flex gap-2">
              <ArrowDown aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
              {m}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-[220px] text-white [&_span]:!text-indigo-100 [&_[role=progressbar]]:!bg-indigo-400/40">
          {step.minutes && (
            <p className="mb-2 flex items-center gap-1.5 text-sm">
              <Timer aria-hidden className="h-4 w-4" />
              {formatDuration(step.minutes)}
            </p>
          )}
          <ProgressBar value={progress(intention)} tone="bg-white" label="Intention progress" />
        </div>
        <LinkButton
          href={`/action/${intention.id}?step=${step.id}`}
          className="!bg-white !text-ink hover:!bg-neutral-100"
        >
          {`Start ${sprintMinutes(step.minutes)}-minute ${step.minutes && step.minutes > MAX_SPRINT ? "focus block" : "session"}`}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </LinkButton>
      </div>
    </section>
  );
}
