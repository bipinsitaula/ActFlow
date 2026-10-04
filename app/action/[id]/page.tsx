"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Camera } from "lucide-react";
import { FocusTimer } from "@/components/action/FocusTimer";
import { ResourceList } from "@/components/action/ResourceList";
import { VerifyChecklist, verifyItems } from "@/components/action/VerifyChecklist";
import { useToast } from "@/components/ui/Toast";
import { useIntentions } from "@/hooks/useIntentions";
import { nextStep } from "@/lib/actions/next";
import { compressImage } from "@/lib/utils/image";
import { MAX_SPRINT, formatDuration, sprintMinutes } from "@/lib/utils/time";
import type { Intention, Step } from "@/types";

function SessionBody({
  intention,
  step,
  onFinish,
}: {
  intention: Intention;
  step: Step;
  onFinish: (proof?: string) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const { addFocus } = useIntentions();
  const items = verifyItems(step);
  const [checks, setChecks] = useState<boolean[]>(() => items.map(() => false));
  const [proof, setProof] = useState<string | undefined>();

  return (
    <FocusTimer
      minutes={sprintMinutes(step.minutes)}
      title={step.title}
      subtitle={intention.title}
      canComplete={checks.every(Boolean)}
      onCancel={() => router.push(`/intention/${intention.id}`)}
      onElapsed={(m) => m > 0 && addFocus(intention.id, m)}
      onFinish={() => onFinish(proof)}
    >
      {step.minutes && step.minutes > MAX_SPRINT && (
        <p className="rounded-xl bg-indigo-50 px-4 py-3 text-center text-sm font-medium text-indigo-800">
          This step takes about {formatDuration(step.minutes)}. Work on it in a focused block now, and come back
          to verify when it&apos;s really done.
        </p>
      )}
      {step.detail && <p className="text-center text-sm leading-relaxed text-slate-600">{step.detail}</p>}

      <ResourceList resources={step.resources} />

      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Verify to finish</h2>
        <VerifyChecklist
          items={items}
          checks={checks}
          onToggle={(n) => setChecks((c) => c.map((v, i) => (i === n ? !v : v)))}
        />
      </div>

      <div className="flex flex-col items-center">
        <p className="mb-3 text-sm font-semibold text-slate-500">Add a photo as proof (optional, +5 XP)</p>
        <label className="group relative grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-full border-4 border-dashed border-slate-200 text-slate-400 transition-all focus-within:border-indigo-400 hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-500">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setProof(await compressImage(file));
              } catch {
                toast("Couldn't read that image.", "error");
              }
            }}
          />
          {proof ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={proof} alt="Your proof" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center text-xs font-bold">
              <Camera aria-hidden className="mb-1 h-6 w-6" />
              Add
            </span>
          )}
        </label>
      </div>
    </FocusTimer>
  );
}

function Session() {
  const { id } = useParams<{ id: string }>();
  const stepId = useSearchParams().get("step");
  const router = useRouter();
  const toast = useToast();
  const { intentions, completeStep } = useIntentions();

  if (!intentions) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-busy />;
  const intention = intentions.find((i) => i.id === id);
  const step = intention?.steps.find((s) => s.id === stepId) ?? (intention && nextStep(intention));

  if (!intention || !step) {
    return (
      <div>
        <p className="font-semibold">Nothing to start here.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-indigo-600 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <SessionBody
      key={step.id}
      intention={intention}
      step={step}
      onFinish={(proof) => {
        completeStep(intention.id, step.id, proof);
        const rest = intention.steps.every((s) => s.id === step.id || s.done);
        toast(rest ? "Intention completed. Every step verified." : "Step verified and complete.", "success");
        router.push(`/intention/${intention.id}`);
      }}
    />
  );
}

export default function ActionPage() {
  return (
    <Suspense fallback={null}>
      <Session />
    </Suspense>
  );
}
