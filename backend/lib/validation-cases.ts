import { ruleFor } from "../config/aura";
import { severityFor } from "./evaluate";
import type { NumericMetric, Severity } from "./types";

const EXAMPLES: { metric: NumericMetric; value: number; expected: Severity; label: string }[] = [
  { metric: "coreTemp", value: 37, expected: "nominal", label: "Core baseline" },
  { metric: "coreTemp", value: 38.6, expected: "caution", label: "Core caution (confirmed gap policy)" },
  { metric: "coreTemp", value: 39, expected: "critical", label: "Core critical" },
  { metric: "cabinTemp", value: 22, expected: "nominal", label: "Cabin baseline" },
  { metric: "cabinTemp", value: 16.5, expected: "caution", label: "Cabin cold caution" },
  { metric: "cabinTemp", value: 15.9, expected: "critical", label: "Cabin cold critical" },
  { metric: "co", value: 8, expected: "nominal", label: "CO baseline" },
  { metric: "co", value: 14, expected: "caution", label: "CO project early warning" },
  { metric: "co", value: 425, expected: "critical", label: "CO project red tier (duration unknown)" },
  { metric: "cumulativeDose", value: 145, expected: "nominal", label: "Cumulative-dose baseline" },
  { metric: "cumulativeDose", value: 310, expected: "caution", label: "Project cumulative warning" },
  { metric: "cumulativeDose", value: 600, expected: "critical", label: "Career-dose review; not an acute alarm" },
  { metric: "absorbedDoseGy", value: 0.99, expected: "nominal", label: "Below experimental GI-risk trigger" },
  { metric: "absorbedDoseGy", value: 1, expected: "critical", label: "Experimental GI-risk indicator" },
];

export function runValidationCases() {
  return EXAMPLES.map((example) => {
    const rule = ruleFor(example.metric)!;
    const actual = severityFor(rule, example.value).severity;
    return { ...example, actual, unit: rule.unit, sourceId: rule.citationId, passed: actual === example.expected };
  });
}
