import { promises as fs } from "fs";
import path from "path";

/**
 * Global board storage: a JSON file next to the app. Everyone who uses this running server shares it.
 * Scores are self-reported by each browser and there is no server-side proof, so treat it as friendly competition.
 */
export interface Entry {
  id: string;
  name: string;
  xp: number;
  steps: number;
  finished: number;
  streak: number;
  updatedAt: string;
}

const FILE = path.join(process.cwd(), "data", "leaderboard.json");
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Entry[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as Entry[]) : [];
  } catch {
    return [];
  }
}

/** Serialise read-modify-write cycles so concurrent requests can't clobber each other. */
function mutate<T>(fn: (all: Entry[]) => { next: Entry[]; result: T }): Promise<T> {
  const run = queue.then(async () => {
    const { next, result } = fn(await load());
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const readBoard = load;

export function upsert(entry: Entry) {
  return mutate((all) => ({ next: [...all.filter((e) => e.id !== entry.id), entry], result: true }));
}

export function remove(id: string) {
  return mutate((all) => ({ next: all.filter((e) => e.id !== id), result: true }));
}
