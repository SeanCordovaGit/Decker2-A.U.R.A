import { Brain, HeartPulse, Radiation, Snowflake, ThermometerSun, Wind, type LucideIcon } from "lucide-react";
import { CATEGORY_META } from "@aura/core/config/aura";
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
    <Badge variant={severity}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${severity === "critical" ? "pulse" : ""} ${severity === "nominal" ? "opacity-60" : ""}`} />
      {SEVERITY_LABEL[severity]}
    </Badge>
  );
}

/** Category colour swatch: colour is never the only signal, so it always sits beside a label. */
export function Swatch({ category, active = false }: { category: HazardCategory; active?: boolean }) {
  const color = CATEGORY_META[category].color;
  return (
    <span
      aria-hidden
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/20"
      style={{ background: color, boxShadow: active ? `0 0 10px 1px ${color}` : "none" }}
    />
  );
}
