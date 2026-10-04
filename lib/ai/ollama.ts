const HOST = process.env.OLLAMA_HOST ?? "http://localhost:11434";
export const MODEL = process.env.OLLAMA_MODEL ?? "gemma4:e4b";

/** Ask the local model for a JSON object. Returns null on any failure so callers can fall back. */
export async function ollamaJSON<T>(system: string, user: string): Promise<T | null> {
  try {
    const res = await fetch(`${HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        format: "json",
        // Gemma 4 can "think" before answering. We only need the JSON, so skip it for speed.
        think: false,
        keep_alive: "30m",
        options: { temperature: 0.3 },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      // The first call after a cold start has to load the model into memory.
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { message?: { content?: string } };
    const content = data.message?.content;
    return content ? (JSON.parse(content) as T) : null;
  } catch {
    return null;
  }
}

export interface OllamaStatus {
  online: boolean;
  model: string;
  /** True when the configured model is pulled and ready to use. */
  installed: boolean;
}

export async function ollamaStatus(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${HOST}/api/tags`, { signal: AbortSignal.timeout(2_500), cache: "no-store" });
    if (!res.ok) return { online: false, model: MODEL, installed: false };
    const data = (await res.json()) as { models?: { name: string }[] };
    const installed = !!data.models?.some((m) => m.name === MODEL || m.name === `${MODEL}:latest`);
    return { online: true, model: MODEL, installed };
  } catch {
    return { online: false, model: MODEL, installed: false };
  }
}
