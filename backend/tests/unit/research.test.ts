import { describe, expect, it } from "vitest";
import { buildAlerts, evaluateCategories, evaluateMetrics, severityFor } from "../../lib/evaluate";
import { computeMhi } from "../../lib/mhi";
import { NOMINAL_READINGS } from "../../lib/simulation";
import { ruleFor } from "../../config/aura";

const nominalMhi = computeMhi({ biometrics: 95, affect: 95, journal: 95 });
describe("updated research bands", () => {
  it.each([[9,"nominal"],[10,"caution"],[15,"caution"],[55,"caution"],[424,"caution"],[425,"critical"]] as const)("grades CO %s", (value, severity) => {
    expect(severityFor(ruleFor("co")!,value).severity).toBe(severity);
  });
  it("escalates the 7-day concentration reference without declaring a fire", () => {
    const r={...NOMINAL_READINGS,co:55};const alert=buildAlerts(r,evaluateMetrics(r),nominalMhi,0).find(a=>a.metric==="co")!;
    expect(alert.escalation).toBe("flightSurgeon");expect(alert.thresholdText).toContain("7-day");expect(alert.action.toLowerCase()).not.toContain("possible fire");
  });
  it.each([[15.99,"critical"],[16,"caution"],[18.2,"caution"],[18.3,"nominal"],[26.7,"nominal"],[26.8,"caution"],[29,"caution"],[29.01,"critical"]] as const)("grades cabin %s",(value,severity)=>{
    expect(severityFor(ruleFor("cabinTemp")!,value).severity).toBe(severity);
  });
  it.each([[34.99,"critical"],[35,"caution"],[35.4,"caution"],[36.4,"caution"],[36.5,"nominal"],[37.5,"nominal"],[37.6,"caution"],[38.9,"caution"],[39,"critical"]] as const)("grades core %s",(value,severity)=>{
    expect(severityFor(ruleFor("coreTemp")!,value).severity).toBe(severity);
  });
  it.each([[150,"nominal"],[150.01,"caution"],[599.99,"caution"],[600,"critical"]] as const)("grades cumulative radiation %s",(value,severity)=>{
    expect(severityFor(ruleFor("cumulativeDose")!,value).severity).toBe(severity);
  });
  it.each([[249,2,51,"nominal"],[250,2,51,"caution"],[350,4,30,"caution"],[351,2,51,"critical"],[230,5,51,"critical"],[230,2,29,"critical"]] as const)("grades PVT/HRV %s %s %s",(pvtReactionMs,pvtLapses,hrv,severity)=>{
    const r={...NOMINAL_READINGS,pvtReactionMs,pvtLapses,hrv};expect(evaluateCategories(r,evaluateMetrics(r),nominalMhi).find(c=>c.category==="mental")!.severity).toBe(severity);
  });
  it("keeps Gy independent of mSv and marks the lower abdomen",()=>{
    const r={...NOMINAL_READINGS,absorbedDoseGy:1};const status=evaluateCategories(r,evaluateMetrics(r),nominalMhi).find(c=>c.category==="injury")!;expect(status.regions.abdomen).toBe("critical");
    const other={...NOMINAL_READINGS,cumulativeDose:1000};expect(evaluateCategories(other,evaluateMetrics(other),nominalMhi).find(c=>c.category==="injury")!.regions.abdomen).toBeUndefined();
  });
});
