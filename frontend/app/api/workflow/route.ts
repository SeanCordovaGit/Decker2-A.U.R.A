import { validateWorkflowInput } from "@aura/core/lib/workflow";
import { explainWorkflow, workflowFallback } from "@/lib/gemini-workflow";

let windowStarted = 0;
let requests = 0;
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Cross-origin requests are not supported." }, { status: 403, headers });
  let input;
  try {
    const text = await request.text();
    if (text.length > 12000) throw new Error("Request too large");
    input = validateWorkflowInput(JSON.parse(text));
  } catch { return Response.json({ error: "Provide a valid workflow, report, readings and follow-up answers." }, { status: 400, headers }); }
  const now = Date.now();
  if (now - windowStarted >= 60000) { windowStarted = now; requests = 0; }
  if (++requests > 20) return Response.json(workflowFallback(input, "rate-limited"), { headers });
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const result = await explainWorkflow(input, { apiKey: process.env.GEMINI_API_KEY, model, signal: request.signal });
  return Response.json(result, { headers });
}
