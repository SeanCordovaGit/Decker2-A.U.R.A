"use client";

import { create } from "zustand";
import { ESCALATION } from "@aura/core/config/aura";
import { buildAlerts, evaluateCategories, evaluateMetrics } from "@aura/core/lib/evaluate";
import { biometricScore, computeMhi } from "@aura/core/lib/mhi";
import { crewProfile } from "@aura/core/lib/research-data";
import { scenarioById } from "@aura/core/lib/scenarios";
import { scoreSentiment } from "@aura/core/lib/sentiment";
import { NOMINAL_READINGS, tickReadings } from "@aura/core/lib/simulation";
import type {
  Alert,
  AlertLogEntry,
  CategoryStatus,
  JournalEntry,
  MetricStatus,
  MhiResult,
  Readings,
  SpaceWeatherEvent,
} from "@aura/core/lib/types";

const HISTORY_LEN = 60;
const LOG_LEN = 100;

export const HISTORY_KEYS = ["doseRate", "co", "co2", "coreTemp", "heartRate", "pvtReactionMs", "cabinTemp"] as const;
export type HistoryKey = (typeof HISTORY_KEYS)[number];
export type HistoryPoint = Record<HistoryKey, number>;

interface Derived {
  mhi: MhiResult;
  metrics: MetricStatus[];
  categories: CategoryStatus[];
  rawAlerts: Alert[];
}

type IncidentReport = { report: string; answers: Record<string, "yes" | "no" | "unknown"> };

interface AuraState extends Derived {
  t: number;
  selectedCrewId: string | null;
  providedMhiScore: number | null;
  selectCrew: (id: string | null) => void;
  readings: Readings;
  history: HistoryPoint[];
  scenarioId: string | null;
  scenarioStart: number;
  replayEvent: SpaceWeatherEvent | null;
  journal: JournalEntry[];
  alerts: Alert[];
  openedAt: Record<string, number>;
  log: AlertLogEntry[];
  logSeq: number;
  tick: () => void;
  triggerScenario: (id: string) => void;
  replaySep: (event: SpaceWeatherEvent) => void;
  clearSepReplay: () => void;
  submitJournal: (text: string) => void;
  incidentReports: Partial<Record<"hand" | "cold", IncidentReport>>;
  setIncidentReport: (kind: "hand" | "cold", report: string, answers: IncidentReport["answers"]) => void;
  reportUrgentConcern: (kind: "hand" | "cold") => void;
  reset: () => void;
}

function derive(readings: Readings, journal: JournalEntry[], now: number, providedMhiScore: number | null = null): Derived {
  const mhi = computeMhi({
    biometrics: biometricScore(readings),
    affect: readings.affectScore,
    journal: journal.length ? journal[journal.length - 1].score : null,
  }, providedMhiScore);
  const metrics = evaluateMetrics(readings);
  const categories = evaluateCategories(readings, metrics, mhi);
  return { mhi, metrics, categories, rawAlerts: buildAlerts(readings, metrics, mhi, now) };
}

const point = (r: Readings): HistoryPoint =>
  Object.fromEntries(HISTORY_KEYS.map((k) => [k, r[k]])) as HistoryPoint;

/** Applies persistence escalation and returns log entries for every change. */
function reconcile(raw: Alert[], prev: Alert[], openedAt: Record<string, number>, t: number, seq: number) {
  const prevByKey = new Map(prev.map((a) => [a.key, a]));
  const nextOpened: Record<string, number> = {};
  const entries: AlertLogEntry[] = [];
  const now = Date.now();
  const push = (a: Alert, event: AlertLogEntry["event"]) =>
    entries.push({ id: ++seq, time: now, key: a.key, category: a.category, metric: a.metric, direction: a.direction, title: a.title, severity: a.severity, escalation: a.escalation, event });

  const alerts = raw.map((a) => {
    const before = prevByKey.get(a.key);
    const opened = openedAt[a.key] ?? t;
    nextOpened[a.key] = opened;
    const out: Alert = { ...a, createdAt: before?.createdAt ?? now };
    if (out.severity === "caution" && out.escalation === "crew" && !out.key.startsWith("sep:") && t - opened >= ESCALATION.cautionPersistSeconds) {
      out.escalation = "flightSurgeon";
      out.escalated = true;
    }
    if (!before) push(out, "opened");
    else if (before.severity !== out.severity) push(out, "changed");
    else if (!before.escalated && out.escalated) push(out, "escalated");
    return out;
  });
  const keys = new Set(alerts.map((a) => a.key));
  for (const p of prev) if (!keys.has(p.key)) push({ ...p, severity: "nominal" }, "cleared");
  return { alerts, openedAt: nextOpened, entries: entries.reverse(), seq };
}

function initial(selectedCrewId: string | null = null) {
  const crew = crewProfile(selectedCrewId);
  const readings = { ...NOMINAL_READINGS, ...crew?.readings };
  const providedMhiScore = crew?.mhiScore ?? null;
  return {
    t: 0,
    selectedCrewId,
    providedMhiScore,
    readings,
    history: [point(readings)],
    scenarioId: null as string | null,
    scenarioStart: 0,
    replayEvent: null as SpaceWeatherEvent | null,
    journal: [] as JournalEntry[],
    incidentReports: {} as Partial<Record<"hand" | "cold", IncidentReport>>,
    alerts: [] as Alert[],
    openedAt: {} as Record<string, number>,
    log: [] as AlertLogEntry[],
    logSeq: 0,
    // timestamps start at 0: Date.now() is not allowed during server prerender
    ...derive(readings, [], 0, providedMhiScore),
  };
}

export const useAuraStore = create<AuraState>((set, get) => {
  const apply = (readings: Readings, journal: JournalEntry[], t: number, providedMhiScore: number | null) => {
    const s = get();
    const d = derive(readings, journal, Date.now(), providedMhiScore);
    const r = reconcile(d.rawAlerts, s.alerts, s.openedAt, s.selectedCrewId && !s.scenarioId ? 0 : t, s.logSeq);
    return { ...d, alerts: r.alerts, openedAt: r.openedAt, log: [...r.entries, ...s.log].slice(0, LOG_LEN), logSeq: r.seq };
  };

  return {
    ...initial(),

    selectCrew: (id) => {
      if (id !== null && !crewProfile(id)) return;
      const fresh = initial(id);
      const derived = derive(fresh.readings, [], Date.now(), fresh.providedMhiScore);
      const reconciled = reconcile(derived.rawAlerts, [], {}, 0, 0);
      set({ ...fresh, ...derived, alerts: reconciled.alerts, openedAt: reconciled.openedAt, log: reconciled.entries, logSeq: reconciled.seq });
    },

    tick: () => {
      const s = get();
      const t = s.t + 1;
      const scenario = scenarioById(s.scenarioId);
      if (s.selectedCrewId && !scenario) {
        set({ t });
        return;
      }
      const base = crewProfile(s.selectedCrewId)?.readings ?? {};
      const readings = tickReadings(s.readings, { ...base, ...(scenario ? scenario.targets(t - s.scenarioStart) : {}), ...(s.replayEvent ? { sepActive: true, sepEvent: s.replayEvent } : {}) });
      set({ t, readings, history: [...s.history, point(readings)].slice(-HISTORY_LEN), ...apply(readings, s.journal, t, s.providedMhiScore) });
    },

    triggerScenario: (id) => {
      const scenario = scenarioById(id);
      if (!scenario) return;
      set((s) => ({ incidentReports: {}, readings: { ...s.readings, reportedConcerns: {}, sepEvent: id === "sep" ? undefined : s.readings.sepEvent }, providedMhiScore: null, scenarioId: id, scenarioStart: s.t, replayEvent: id === "sep" ? null : s.replayEvent }));
      if (scenario.journalText) get().submitJournal(scenario.journalText);
      get().tick();
    },

    replaySep: (event) => {
      const s = get();
      const readings = { ...s.readings, sepActive: true, sepEvent: event };
      set({ replayEvent: event, scenarioId: s.scenarioId === "sep" ? null : s.scenarioId, readings, ...apply(readings, s.journal, s.t, s.providedMhiScore) });
    },

    clearSepReplay: () => {
      const s = get();
      const readings = { ...s.readings, sepActive: s.scenarioId === "sep", sepEvent: undefined };
      set({ replayEvent: null, readings, ...apply(readings, s.journal, s.t, s.providedMhiScore) });
    },

    submitJournal: (text) => {
      const scored = scoreSentiment(text);
      const entry: JournalEntry = { text, createdAt: Date.now(), sentiment: scored?.sentiment ?? null, score: scored?.score ?? null };
      const s = get();
      const journal = [...s.journal, entry].slice(-20);
      const providedMhiScore = scored === null ? s.providedMhiScore : null;
      set({ journal, providedMhiScore, ...apply(s.readings, journal, s.t, providedMhiScore) });
    },

    setIncidentReport: (kind, report, answers) => set((s) => ({ incidentReports: { ...s.incidentReports, [kind]: { report, answers } } })),

    reportUrgentConcern: (kind) => {
      const s = get();
      const readings = { ...s.readings, reportedConcerns: { ...s.readings.reportedConcerns, [kind]: true } };
      set({ readings, ...apply(readings, s.journal, s.t, s.providedMhiScore) });
    },

    reset: () => {
      const s = get();
      const fresh = initial(s.selectedCrewId);
      set({ ...fresh, alerts: buildAlerts(fresh.readings, fresh.metrics, fresh.mhi, Date.now()), t: s.t, log: s.log, logSeq: s.logSeq });
    },
  };
});
