import { Brain, HeartPulse, Radiation, Snowflake, ThermometerSun, Wind, type LucideIcon } from "lucide-react";
import { getIndicatorColor, SEVERITY_META, type IndicatorContext } from "@aura/core/config/aura";
import type { HazardCategory, Severity } from "@aura/core/lib/types";
import { Badge } from "@/components/ui/badge";

/** Domain pieces only; generic UI comes from shadcn in components/ui. */
export const CATEGORY_ICON: Record<HazardCategory, LucideIcon> = {
  radiation: Radiation,
  air: Wind,
  cabinHot: ThermometerSun,
  cabinCold: Snowflake,
  mental: Brain,
  injury: HeartPulse,
};

const SEVERITY_LABEL: Record<Severity, string> = { nominal: "Nominal", caution: "Caution", critical: "Critical" };

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge variant={severity} style={severity === "nominal" ? undefined : { color: SEVERITY_META[severity].badgeColor, borderColor: SEVERITY_META[severity].badgeColor, backgroundColor: `${SEVERITY_META[severity].badgeColor}1f` }}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${severity === "critical" ? "pulse" : ""} ${severity === "nominal" ? "opacity-60" : ""}`} />
      {SEVERITY_LABEL[severity]}
    </Badge>
  );
}

/** Action indicator, always accompanied by a category or severity label. */
export function Swatch({ category, active = false, severity = "caution", context }: { category: HazardCategory; active?: boolean; severity?: Severity; context?: IndicatorContext }) {
  const color = getIndicatorColor(category, severity, context);
  return (
    <span
      aria-hidden
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/20"
      style={{ background: color, opacity: active ? 1 : 0.7 }}
    />
  );
}
