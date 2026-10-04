import { ollamaStatus } from "@/lib/ai/ollama";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await ollamaStatus());
}
