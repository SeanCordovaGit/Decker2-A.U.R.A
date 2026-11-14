"use client";

import { create } from "zustand";
import { ESCALATION } from "@aura/core/config/aura";
import { buildAlerts, evaluateCategories, evaluateMetrics } from "@aura/core/lib/evaluate";
import { biometricScore, computeMhi, pvtScore } from "@aura/core/lib/mhi";
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

interface AuraState extends Derived {
  t: number;
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
  submitJournal: (text: string) => void;
  reset: () => void;
}

function derive(readings: Readings, journal: JournalEntry[], now: number): Derived {
  const mhi = computeMhi({
    biometrics: biometricScore(readings),
    affect: readings.affectScore,
    journal: journal.length ? journal[journal.length - 1].score : null,
    pvt: pvtScore(readings.pvtReactionMs),
  });
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
    entries.push({ id: ++seq, time: now, key: a.key, category: a.category, title: a.title, severity: a.severity, escalation: a.escalation, event });

  const alerts = raw.map((a) => {
    const before = prevByKey.get(a.key);
    const opened = openedAt[a.key] ?? t;
    nextOpened[a.key] = opened;
    const out: Alert = { ...a, createdAt: before?.createdAt ?? now };
    if (out.severity === "caution" && out.escalation === "crew" && t - opened >= ESCALATION.cautionPersistSeconds) {
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

function initial() {
  const readings = { ...NOMINAL_READINGS };
  return {
    t: 0,
    readings,
    history: [point(readings)],
    scenarioId: null as string | null,
    scenarioStart: 0,
    replayEvent: null as SpaceWeatherEvent | null,
    journal: [] as JournalEntry[],
    alerts: [] as Alert[],
    openedAt: {} as Record<string, number>,
    log: [] as AlertLogEntry[],
    logSeq: 0,
    // timestamps start at 0: Date.now() is not allowed during server prerender
    ...derive(readings, [], 0),
  };
}

export const useAuraStore = create<AuraState>((set, get) => {
  const apply = (readings: Readings, journal: JournalEntry[], t: number) => {
    const s = get();
    const d = derive(readings, journal, Date.now());
    const r = reconcile(d.rawAlerts, s.alerts, s.openedAt, t, s.logSeq);
    return { ...d, alerts: r.alerts, openedAt: r.openedAt, log: [...r.entries, ...s.log].slice(0, LOG_LEN), logSeq: r.seq };
  };

  return {
    ...initial(),

    tick: () => {
      const s = get();
      const t = s.t + 1;
      const scenario = scenarioById(s.scenarioId);
      const readings = tickReadings(s.readings, scenario ? scenario.targets(t - s.scenarioStart) : {});
      set({ t, readings, history: [...s.history, point(readings)].slice(-HISTORY_LEN), ...apply(readings, s.journal, t) });
    },

    triggerScenario: (id) => {
      const scenario = scenarioById(id);
      if (!scenario) return;
      set((s) => ({ scenarioId: id, scenarioStart: s.t, replayEvent: id === "sep" ? s.replayEvent : null }));
      if (scenario.journalText) get().submitJournal(scenario.journalText);
      get().tick();
    },

    replaySep: (event) => {
      set({ replayEvent: event });
      get().triggerScenario("sep");
    },

    submitJournal: (text) => {
      const scored = scoreSentiment(text);
      const entry: JournalEntry = { text, createdAt: Date.now(), sentiment: scored?.sentiment ?? null, score: scored?.score ?? null };
      const s = get();
      const journal = [...s.journal, entry].slice(-20);
      set({ journal, ...apply(s.readings, journal, s.t) });
    },

    reset: () => {
      const s = get();
      const fresh = initial();
      set({ ...fresh, t: s.t, log: s.log, logSeq: s.logSeq });
    },
  };
});
