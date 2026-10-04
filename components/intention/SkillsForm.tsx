"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Level, SkillInput } from "@/types";

const LEVELS: { id: Level; label: string }[] = [
  { id: "none", label: "None yet" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const field =
  "rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export function SkillsForm({
  title,
  initialSkills,
  initialContext,
  busy,
  onSubmit,
  onSkip,
}: {
  title: string;
  initialSkills: SkillInput[];
  initialContext: string;
  busy: boolean;
  onSubmit: (skills: SkillInput[], context: string) => void;
  onSkip: () => void;
}) {
  const [rows, setRows] = useState<SkillInput[]>(
    initialSkills.length ? initialSkills : [{ name: "", level: "beginner" }],
  );
  const [context, setContext] = useState(initialContext);

  const update = (n: number, patch: Partial<SkillInput>) =>
    setRows((r) => r.map((row, i) => (i === n ? { ...row, ...patch } : row)));

  return (
    <form
      className="rise space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(rows.filter((r) => r.name.trim()).map((r) => ({ ...r, name: r.name.trim() })), context.trim());
      }}
    >
      <div>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
          <ShieldCheck aria-hidden className="h-4 w-4" />
          Reality check
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">What do you already bring?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Be honest. This tells us whether &ldquo;{title}&rdquo; is a good fit right now, and what to learn first.
        </p>
      </div>

      <fieldset className="space-y-2.5">
        <legend className="mb-2 text-sm font-semibold">Relevant skills and experience</legend>
        {rows.map((row, n) => (
          <div key={n} className="flex items-center gap-2">
            <input
              className={`${field} min-w-0 flex-1`}
              placeholder="e.g. public speaking, React, first aid"
              aria-label={`Skill ${n + 1}`}
              value={row.name}
              maxLength={60}
              onChange={(e) => update(n, { name: e.target.value })}
            />
            <select
              className={field}
              aria-label={`Level for skill ${n + 1}`}
              value={row.level}
              onChange={(e) => update(n, { level: e.target.value as Level })}
            >
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={`Remove skill ${n + 1}`}
              onClick={() => setRows((r) => (r.length > 1 ? r.filter((_, i) => i !== n) : [{ name: "", level: "beginner" }]))}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ))}
        {rows.length < 12 && (
          <button
            type="button"
            onClick={() => setRows((r) => [...r, { name: "", level: "beginner" }])}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline"
          >
            <Plus aria-hidden className="h-4 w-4" />
            Add a skill
          </button>
        )}
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">About you (optional)</span>
        <textarea
          className={`${field} w-full resize-none`}
          rows={3}
          maxLength={600}
          placeholder="Age, background, what you can commit each week, anything that matters..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy} className="!rounded-2xl !py-3.5">
          {busy ? "Checking..." : "Check if I'm ready"}
        </Button>
        <button type="button" onClick={onSkip} disabled={busy} className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Skip this check
        </button>
      </div>
    </form>
  );
}
