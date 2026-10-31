import { describe, expect, it } from "vitest";
import { SEEDED_INCIDENTS } from "./seedIncidents";
import { GOLDEN_EXAMPLES } from "./goldenExamples";
import {
  LITE_EBITDA_USDM,
  LITE_REVENUE_USDM,
  calculateLiteScenario,
  clampLiteInputs,
  defaultLiteInputs,
  isDirectTheftExample,
  liteCounterfactual,
  liteOverrides,
} from "./liteScenario";
import { computeMateriality } from "./computeMateriality";

function caseFor(id: string) {
  const incident = SEEDED_INCIDENTS.find((item) => item.id === id);
  if (!incident) throw new Error(`Missing test case ${id}`);
  return incident;
}

describe("INQUISITION Lite functional learning workspace", () => {
  it("has five genuinely selectable cases backed by the existing catalog", () => {
    expect(GOLDEN_EXAMPLES).toHaveLength(5);
    for (const example of GOLDEN_EXAMPLES) {
      expect(caseFor(example.id).evidence.length).toBeGreaterThan(0);
    }
  });

  it("reuses the full model unchanged for regular cyber cases", () => {
    const mgm = caseFor("inc_mgm_resorts_2023");
    const input = defaultLiteInputs(mgm);
    expect(isDirectTheftExample(mgm)).toBe(false);
    const actual = calculateLiteScenario(mgm, input);
    const expected = computeMateriality(mgm, liteOverrides(input));
    expect(actual.outputs).toEqual(expected.outputs);
    expect(expected.inputs.revenueUSDm).toBe(LITE_REVENUE_USDM);
    expect(expected.inputs.ebitdaUSDm).toBe(LITE_EBITDA_USDM);
    expect(actual.unrecoveredAssetExposureUSDm).toBeNull();
  });

  it("interactive downtime changes only modeled scenario inputs, not the real case", () => {
    const jlr = caseFor("inc_jaguar_land_rover_2025");
    const beforeCase = JSON.stringify(jlr);
    const start = defaultLiteInputs(jlr);
    const larger = { ...start, downtimeDays: start.downtimeDays + 5 };
    const baselineLoss = calculateLiteScenario(jlr, start).outputs?.categories.find(
      (c) => c.category === "business_interruption"
    )?.rangeUSDm.mostLikely;
    const changedLoss = calculateLiteScenario(jlr, larger).outputs?.categories.find(
      (c) => c.category === "business_interruption"
    )?.rangeUSDm.mostLikely;
    expect(changedLoss).toBeGreaterThan(baselineLoss ?? 0);
    expect(JSON.stringify(jlr)).toBe(beforeCase);
  });

  it("record scope drives only the illustrative record-response component", () => {
    const equifax = caseFor("inc_equifax_2017");
    const start = { ...defaultLiteInputs(equifax), recordsMillions: 2 };
    const changed = { ...start, recordsMillions: 3 };
    const base = calculateLiteScenario(equifax, start);
    const next = calculateLiteScenario(equifax, changed);
    const privacy = (value: typeof base) => value.outputs?.categories.find(
      (c) => c.category === "information_privacy"
    )?.rangeUSDm.mostLikely;
    expect(privacy(next)).toBeGreaterThan(privacy(base) ?? 0);
    expect(next.outputs?.categories.find((c) => c.category === "business_interruption")?.rangeUSDm)
      .toEqual(base.outputs?.categories.find((c) => c.category === "business_interruption")?.rangeUSDm);
  });

  it("flags direct asset theft as outside full LM rather than remapping theft as extortion", () => {
    const bybit = caseFor("inc_bybit_2025");
    const start = defaultLiteInputs(bybit);
    expect(isDirectTheftExample(bybit)).toBe(true);
    expect(calculateLiteScenario(bybit, start).outputs).toBeNull();
    expect(calculateLiteScenario(bybit, start).unrecoveredAssetExposureUSDm).toBe(1500);
    const hypothetical = { ...start, recoveredTheftPct: 20 };
    expect(calculateLiteScenario(bybit, hypothetical).unrecoveredAssetExposureUSDm).toBe(1200);
  });

  it("has explicit bounded counterfactuals and no magical effectiveness claim", () => {
    const start = { downtimeDays: 12, recordsMillions: 8, recoveredTheftPct: 10 };
    expect(liteCounterfactual(start, "recovery", false).downtimeDays).toBe(9);
    expect(liteCounterfactual(start, "records", false).recordsMillions).toBe(6);
    expect(liteCounterfactual(start, "evidence", false)).toEqual(start);
    expect(liteCounterfactual(start, "recovery", true).recoveredTheftPct).toBe(35);
    expect(liteCounterfactual(start, "records", true)).toEqual(start);
    expect(clampLiteInputs({ downtimeDays: Infinity, recordsMillions: 1000, recoveredTheftPct: -4 }))
      .toEqual({ downtimeDays: 0, recordsMillions: 50, recoveredTheftPct: 0 });
  });
});
