export const UNITS = [
  { id: "min", label: "minutes", short: "min", mult: 1 },
  { id: "hour", label: "hours", short: "h", mult: 60 },
  { id: "day", label: "days", short: "day", mult: 60 * 24 },
  { id: "week", label: "weeks", short: "week", mult: 60 * 24 * 7 },
  { id: "month", label: "months", short: "month", mult: 60 * 24 * 30 },
  { id: "year", label: "years", short: "year", mult: 60 * 24 * 365 },
] as const;

export type UnitId = (typeof UNITS)[number]["id"];

/** 100 years in minutes: a sane upper bound so nothing overflows or renders absurdly. */
export const MAX_MINUTES = 100 * 60 * 24 * 365;

const trim = (n: number) => String(Math.round(n * 10) / 10);

/** 5 -> "5 min", 90 -> "1.5 h", 2628000 -> "5 years". */
export function formatDuration(minutes: number): string {
  for (let i = UNITS.length - 1; i >= 0; i--) {
    const u = UNITS[i];
    if (minutes >= u.mult) {
      const v = minutes / u.mult;
      if (u.id === "min") return `${trim(v)} min`;
      if (u.id === "hour") return `${trim(v)} h`;
      return `${trim(v)} ${u.short}${Math.round(v * 10) / 10 === 1 ? "" : "s"}`;
    }
  }
  return `${minutes} min`;
}

/** Pick the largest unit that expresses the value without a messy fraction. */
export function splitDuration(minutes: number): { value: number; unit: UnitId } {
  for (let i = UNITS.length - 1; i >= 0; i--) {
    const u = UNITS[i];
    const v = minutes / u.mult;
    if (v >= 1 && Math.abs(v * 10 - Math.round(v * 10)) < 1e-6) {
      return { value: Math.round(v * 10) / 10, unit: u.id };
    }
  }
  return { value: minutes, unit: "min" };
}

export function toMinutes(value: number, unit: UnitId): number | null {
  const mult = UNITS.find((u) => u.id === unit)?.mult ?? 1;
  const m = Math.round(value * mult);
  if (!Number.isFinite(m) || m < 1 || m > MAX_MINUTES) return null;
  return m;
}

/** Longest a countdown makes sense for. Longer steps get a focus block instead. */
export const MAX_SPRINT = 90;
export const FOCUS_BLOCK = 25;

export const sprintMinutes = (minutes?: number) =>
  minutes === undefined ? 10 : minutes <= MAX_SPRINT ? minutes : FOCUS_BLOCK;
