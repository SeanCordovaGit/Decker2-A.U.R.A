"use client";

import { useEffect, useRef, useState } from "react";
import { buildWorkflow, type WorkflowInput } from "@aura/core/lib/workflow";
import { WORKFLOWS, type WorkflowKind } from "@aura/core/config/workflows";
import { SEVERITY_META } from "@aura/core/config/aura";
import { useAuraStore } from "@/store/useAuraStore";
import type { WorkflowResponse } from "@/lib/gemini-workflow";
import WorkflowExplanation from "./WorkflowExplanation";

export default function WorkflowPanel() {
  const scenario = useAuraStore((state) => state.scenarioId);
  const trigger = useAuraStore((state) => state.triggerScenario);
  const kind = scenario === "evaHandInjury" ? "hand" : scenario === "cabinCold" ? "cold" : null;
  if (kind) return <WorkflowSession key={kind} kind={kind} />;
  return <div className="workflow-panel"><h2>What should we do next?</h2><p>Select a supported research scenario to see findings, follow-up questions and source-linked next steps.</p>{Object.entries(WORKFLOWS).map(([key, workflow]) => <button className="workflow-submit" key={key} onClick={() => trigger(workflow.scenarioId)}>{workflow.title}</button>)}</div>;
}

function WorkflowSession({ kind }: { kind: WorkflowKind }) {
  const readings = useAuraStore((state) => state.readings);
  const reportUrgent = useAuraStore((state) => state.reportUrgentConcern);
  const incident = useAuraStore((state) => state.incidentReports[kind]);
  const setIncident = useAuraStore((state) => state.setIncidentReport);
  const report = incident?.report ?? "";
  const answers = incident?.answers ?? {};
  const [result, setResult] = useState<WorkflowResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); }, []);
  const input: WorkflowInput = { kind, report, answers, cabinTemp: readings.cabinTemp, coreTemp: readings.coreTemp, injurySeverity: readings.injuries.rightHand ?? "nominal", reportedUrgent: !!readings.reportedConcerns?.[kind] };
  const plan = buildWorkflow(input);
  const clearExplanation = () => { request.current?.abort(); request.current = null; setResult(null); setBusy(false); setError(""); };
  return <div className="workflow-panel">
    <span className="workflow-research">Research demonstration · Simulated readings</span>
    <h2>{plan.title}: next steps</h2>
    <p className="workflow-report-source">{kind === "hand" ? "Affected side: right hand · Source: simulated crew assessment and explicit symptom answers." : "Source: simulated cabin/core readings and explicit crew symptom answers."}</p>
    <div className="workflow-assessment" style={{ borderColor: SEVERITY_META[plan.severity].badgeColor }}>
      <strong style={{ color: SEVERITY_META[plan.severity].badgeColor }}>Rule-based status: {plan.severity}</strong>
      <p>{plan.responder === "flightSurgeon" ? "Flight surgeon / crew medical officer assessment indicated" : "Crew review indicated; clarify symptoms below"}</p>
      {report.trim() && <p>Reported symptoms: {report}</p>}
    </div>
    <h3>What to do next</h3>
    <ol>{plan.steps.map((step) => <li key={step.id}>{step.text}</li>)}</ol>
    <p className="workflow-review">Medical protocol review pending. Public references inform these demonstration prompts; no mission-approved treatment protocol is included. Gemini cannot prescribe or change escalation.</p>
    <details><summary>Why this was flagged · readings and sources</summary>
      {plan.findings.map((finding) => {
        const citation = plan.sources.find((source) => source.id === finding.id)?.citation;
        return <div className="workflow-finding" key={finding.id}><p>{finding.text}</p><small>{citation?.text}</small>{citation?.url && <a href={citation.url} target="_blank" rel="noreferrer">Read source</a>}</div>;
      })}
    </details>
    <form onSubmit={async (event) => {
      event.preventDefault();
      clearExplanation();
      const controller = new AbortController();
      request.current = controller;
      setBusy(true);
      try {
        const response = await fetch("/api/workflow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: controller.signal });
        if (!response.ok) throw new Error("Workflow request failed");
        const body: WorkflowResponse = await response.json();
        if (request.current === controller && !controller.signal.aborted) setResult(body);
      } catch {
        if (!controller.signal.aborted) setError("Cloud explanation unavailable. The rule-based findings and next steps above remain available.");
      } finally { if (request.current === controller) setBusy(false); }
    }}>
      <label className="workflow-report-label" htmlFor="incident-report">What happened?</label>
      <textarea id="incident-report" maxLength={2000} rows={3} value={report} onChange={(event) => { clearExplanation(); setIncident(kind, event.target.value, answers); }} placeholder={kind === "hand" ? "Example: I injured my right hand while moving equipment. It hurts when I try to grip something." : "Describe the cold cabin area and how the crew feels."} />
      <h3>Clarifying questions</h3>
      {plan.questions.map((question) => <label className="workflow-question" key={question.id}><span>{question.text}</span><select aria-label={question.text} value={answers[question.id] ?? "unknown"} onChange={(event) => {
        clearExplanation();
        const next = { ...answers, [question.id]: event.target.value as "yes" | "no" | "unknown" };
        setIncident(kind, report, next);
        if (buildWorkflow({ ...input, answers: next }).urgentReport && !readings.reportedConcerns?.[kind]) reportUrgent(kind);
      }}><option value="unknown">Not answered / unsure</option><option value="yes">Yes</option><option value="no">No</option></select></label>)}
      <p>Urgent answers trigger the rule engine immediately. Gemini is optional and is never required for escalation. Report flags stay active until you reset or change the scenario.</p>
      <button className="workflow-submit" type="submit" disabled={!report.trim() || busy}>{busy ? "Preparing grounded explanation…" : "Explain with Gemini"}</button>
      <p className="workflow-privacy">This button sends your incident report, answers and the relevant simulated readings to Google. Your private journal is not sent. Report text is not logged or saved by this app’s server.</p>
    </form>
    {error && <p role="status">{error}</p>}
    {result && (result.plan.severity === plan.severity ? <WorkflowExplanation result={result} /> : <p role="status">The status changed since this explanation. Use the current rule-based next steps above and request a fresh summary.</p>)}
  </div>;
}
