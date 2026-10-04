"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { MAX_MINUTES, UNITS, formatDuration, splitDuration, toMinutes, type UnitId } from "@/lib/utils/time";

/** Shows a duration and lets the user set it to anything from a minute to 100 years. */
export function DurationEditor({
  minutes,
  onSave,
}: {
  minutes?: number;
  onSave: (minutes: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const initial = splitDuration(minutes ?? 10);
  const [value, setValue] = useState(String(initial.value));
  const [unit, setUnit] = useState<UnitId>(initial.unit);
  const [error, setError] = useState<string | null>(null);

  function save() {
    const m = toMinutes(Number(value), unit);
    if (m === null) {
      setError(`Enter a time between 1 minute and ${Math.round(MAX_MINUTES / 525600)} years.`);
      return;
    }
    onSave(m);
    setEditing(false);
    setError(null);
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          const s = splitDuration(minutes ?? 10);
          setValue(String(s.value));
          setUnit(s.unit);
          setEditing(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
        aria-label={`Time estimate ${minutes ? formatDuration(minutes) : "not set"}. Change it`}
      >
        {minutes ? formatDuration(minutes) : "Set time"}
        <Pencil aria-hidden className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0.1}
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          aria-label="Amount of time"
          className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          autoFocus
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as UnitId)}
          aria-label="Unit of time"
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          {UNITS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
        <button onClick={save} aria-label="Save time" className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
          <Check aria-hidden className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
          aria-label="Cancel"
          className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
