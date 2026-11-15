"use client";

import type { WorkflowResponse } from "@/lib/gemini-workflow";

const FALLBACK_LABEL = {
  "not-configured": "Gemini is not configured. Showing the rule-based workflow.",
  unavailable: "Gemini is unavailable. Showing the rule-based workflow.",
  "invalid-response": "The model response failed the grounding checks and was discarded. Showing the rule-based workflow.",
  "rate-limited": "The demo request limit was reached. Showing the rule-based workflow.",
};

export default function WorkflowExplanation({ result }: { result: WorkflowResponse }) {
  return <section className="workflow-explanation" aria-label="Grounded explanation">
    <h3>{result.trace.provider === "gemini" ? "Gemini evidence summary" : "Local evidence summary"}</h3>
    <p role="status">{result.trace.reason ? FALLBACK_LABEL[result.trace.reason] : "Validated quotes and source IDs only. Gemini did not decide severity or escalation."}</p>
    <p>Reported excerpts:</p>
    {result.explanation.quotes.map((quote, index) => <blockquote key={index}>{quote}</blockquote>)}
    <p>Explanation snapshot · {new Date(result.trace.at).toLocaleTimeString()}</p>
    <ul>{result.explanation.findingIds.map((id) => <li key={id}>{result.plan.findings.find((finding) => finding.id === id)?.text}</li>)}</ul>
    <details><summary>Trace and selected sources</summary><dl>
      <dt>Request</dt><dd>{result.trace.id}</dd>
      <dt>Explanation provider</dt><dd>{result.trace.provider}{result.trace.model ? ` · ${result.trace.model}` : ""}</dd>
      <dt>Severity authority</dt><dd>Deterministic rules</dd>
      <dt>Model output accepted</dt><dd>{result.trace.modelOutputAccepted ? "Yes" : "No"}</dd>
      <dt>Medical protocol review</dt><dd>Pending</dd>
      <dt>Finding IDs</dt><dd>{result.explanation.findingIds.join(", ")}</dd>
      <dt>Question IDs</dt><dd>{result.explanation.questionIds.join(", ")}</dd>
      <dt>Guidance IDs</dt><dd>{result.explanation.stepIds.join(", ")}</dd>
    </dl></details>
  </section>;
}
