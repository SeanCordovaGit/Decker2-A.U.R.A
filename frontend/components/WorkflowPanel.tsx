"use client";

import { compareAlerts } from "@aura/core/lib/evaluate";

import { useEffect, useRef, useState } from "react";
import { WORKFLOW_METRICS, buildWorkflow, type WorkflowInput } from "@aura/core/lib/workflow";
import { WORKFLOWS, workflowForScenario, type WorkflowKind } from "@aura/core/config/workflows";
import { Siren } from "lucide-react";
import { SEVERITY_META, getIndicatorColor } from "@aura/core/config/aura";
import type { Alert } from "@aura/core/lib/types";
import { useAuraStore } from "@/store/useAuraStore";
import { CATEGORY_ICON, SeverityBadge } from "./hazard";
import type { WorkflowResponse } from "@/lib/gemini-workflow";
import WorkflowExplanation from "./WorkflowExplanation";

export default function WorkflowPanel() {
  const scenario = useAuraStore((state) => state.scenarioId);
  const trigger = useAuraStore((state) => state.triggerScenario);
  const alerts = useAuraStore((state) => state.alerts);
  const kind = workflowForScenario(scenario);
  if (kind) {
    const keys = WORKFLOWS[kind].alertKeys ?? [];
    const otherAlerts = alerts.filter((alert) => !keys.includes(alert.metric ?? (alert.key.startsWith("sep:") ? "sep" : alert.key)) && alert.key !== `report:${kind}` && !(kind === "hand" && alert.key === "injury:rightHand"));
    const leadingAlert = [...alerts].sort(compareAlerts)[0];
    const showOtherAlerts = otherAlerts.some((alert) => alert.key === leadingAlert?.key);
    return <>{otherAlerts.length > 0 && <details className="workflow-panel" open={showOtherAlerts}><summary>Other active alerts ({otherAlerts.length})</summary><AlertNextSteps alerts={otherAlerts} /></details>}<WorkflowSession key={kind} kind={kind} /></>;
  }
  if (alerts.length) return <AlertNextSteps alerts={alerts} />;
  return <div className="workflow-panel"><h2>What should we do next?</h2><p>All readings are within limits. Pick a condition below, or one of the guided research workflows, to see its next steps.</p>{Object.entries(WORKFLOWS).map(([key, workflow]) => <button className="workflow-submit" key={key} onClick={() => trigger(workflow.scenarioId)}>{workflow.title}</button>)}</div>;
}

const RESPONDER = { none: "You only", crew: "Crew · self-manage", flightSurgeon: "Flight surgeon" } as const;

function AlertNextSteps({ alerts }: { alerts: Alert[] }) {
  const sorted = [...alerts].sort(compareAlerts);
  return <div className="workflow-panel">
    <h2>What to do next</h2>
    <p className="next-steps-intro">Each step is the <strong>Do now</strong> action from an active alert, most urgent first. Open Alerts for the readings, thresholds and sources behind them.</p>
    <ol className="next-steps">
      {sorted.map((alert) => {
        const Icon = CATEGORY_ICON[alert.category];
        const color = getIndicatorColor(alert.category, alert.severity, alert);
        return <li key={alert.key} className="next-step">
          <header><Icon size={16} strokeWidth={1.5} aria-hidden style={{ color }} /><strong>{alert.title}</strong><SeverityBadge severity={alert.severity} /></header>
          <p className="next-step-action">{alert.action}</p>
          <p className="next-step-meta">{alert.escalation === "flightSurgeon" && <Siren size={12} aria-hidden />}{RESPONDER[alert.escalation]} · {alert.valueText}</p>
        </li>;
      })}
    </ol>
  </div>;
}

function WorkflowSession({ kind }: { kind: WorkflowKind }) {
  const readings = useAuraStore((state) => state.readings);
  const mhi = useAuraStore((state) => state.mhi);
  const mhiIndex = mhi.index;
  const journalEntry = useAuraStore((state) => state.checkInJournalEntry);
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
  const input: WorkflowInput = { kind, report, answers, cabinTemp: readings.cabinTemp, coreTemp: readings.coreTemp, injurySeverity: readings.injuries.rightHand ?? "nominal", reportedUrgent: !!readings.reportedConcerns?.[kind], readings: Object.fromEntries(WORKFLOW_METRICS.map((metric) => [metric, readings[metric]])), sepActive: readings.sepActive, gammaActive: readings.gammaActive, mhiIndex, mhiSources: kind === "distress" && mhi.source === "computed" ? Object.fromEntries(mhi.components.map((component) => [component.source, component.score])) : undefined };
  const plan = buildWorkflow(input);
  const clearExplanation = () => { request.current?.abort(); request.current = null; setResult(null); setBusy(false); setError(""); };
  return <div className="workflow-panel">
    <span className="workflow-research">Research demonstration · Simulated readings</span>
    <h2>{kind === "distress" ? "Mental Distress: private check-in" : `${plan.title}: next steps`}</h2>
    <p className="workflow-report-source">{kind === "distress" ? "Optional check-in in this browser session. Simulated readings and local MHI scores explain the indicator; the MHI is a project estimate." : kind === "hand" ? "Affected side: right hand · Source: simulated crew assessment and explicit symptom answers." : kind === "cold" ? "Source: simulated cabin/core readings and explicit crew symptom answers." : "Source: simulated readings, team-supplied next steps and explicit crew symptom answers."}</p>
    <div className="workflow-assessment" style={{ borderColor: SEVERITY_META[plan.severity].badgeColor }}>
      <strong style={{ color: SEVERITY_META[plan.severity].badgeColor }}>{kind === "distress" ? "Demo indicator" : "Rule-based status"}: {plan.severity}{plan.status && ` — ${plan.status}`}</strong>
      {!plan.status && <p>{plan.responder === "flightSurgeon" ? "Flight surgeon / crew medical officer assessment indicated" : "Crew review indicated; clarify symptoms below"}</p>}
      {report.trim() && <p>{kind === "distress" ? "Your check-in" : "Reported symptoms"}: {report}</p>}
    </div>
    <h3>{kind === "distress" ? "Your options" : "What to do next"}</h3>
    <p>Team-proposed assessment prompts. Confirm operational actions against the applicable mission procedure.</p>
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
      <label className="workflow-report-label" htmlFor="incident-report">{kind === "distress" ? "How are you feeling? (optional)" : "What happened?"}</label>
      <textarea id="incident-report" maxLength={2000} rows={3} value={report} onChange={(event) => { clearExplanation(); setIncident(kind, event.target.value, answers); }} placeholder={plan.placeholder ?? (kind === "hand" ? "Example: I injured my right hand while moving equipment. It hurts when I try to grip something." : "Describe the cold cabin area and how the crew feels.")} />
      {kind === "distress" && journalEntry && <>
        <button className="workflow-submit" type="button" onClick={() => { clearExplanation(); setIncident(kind, journalEntry.slice(0, 2000), answers); }}>Copy latest journal entry</button>
        <p className="workflow-privacy">Copies up to 2,000 characters into this report. Explain with Gemini shares the copied text with Google only when you choose it.</p>
      </>}
      <h3>{kind === "distress" ? "Optional check-in questions" : "Clarifying questions"}</h3>
      {plan.questions.map((question) => <label className="workflow-question" key={question.id}><span>{question.text}</span><select aria-label={question.text} value={answers[question.id] ?? "unknown"} onChange={(event) => {
        clearExplanation();
        const next = { ...answers, [question.id]: event.target.value as WorkflowInput["answers"][string] };
        setIncident(kind, report, next);
        if (buildWorkflow({ ...input, answers: next }).urgentReport && !readings.reportedConcerns?.[kind]) reportUrgent(kind);
      }}>{(question.options ?? [{ value: "unknown", label: kind === "distress" ? "Prefer not to answer / unsure" : "Not answered / unsure" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" }]).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}
      {plan.supportRequested && <p role="status">Support preference saved locally. Contact the crew medical officer through your approved private medical channel. No message has been sent.</p>}
      <p>{kind === "distress" ? "These optional answers provide context. The indicator follows the configured MHI and fatigue rules. You can leave the report blank and request support through your private medical channel." : "Urgent answers trigger the rule engine immediately. Gemini is optional and is never required for escalation. Report flags stay active until you reset or change the scenario."}</p>
      <button className="workflow-submit" type="submit" disabled={!report.trim() || busy}>{busy ? "Preparing grounded explanation…" : "Explain with Gemini"}</button>
      <p className="workflow-privacy">Explain with Gemini sends this report, answers, relevant simulated readings and derived MHI scores to Google. Any journal text you explicitly copied into this report is included. Other journal text stays in this browser session. Report text is not logged or saved by this app’s server.</p>
    </form>
    {error && <p role="status">{error}</p>}
    {result && (result.plan.severity === plan.severity && result.plan.responder === plan.responder ? <WorkflowExplanation result={result} /> : <p role="status">The status changed since this explanation. Use the current rule-based next steps above and request a fresh summary.</p>)}
  </div>;
}
