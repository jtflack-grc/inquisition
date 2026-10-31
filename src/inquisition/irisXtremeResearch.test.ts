import { describe, expect, it } from "vitest";
import { SEEDED_INCIDENTS } from "./seedIncidents";
import { GOLDEN_EXAMPLES } from "./goldenExamples";
import {
  IRIS_XTREME_2026,
  irisRevenueBenchmark,
  irisResearchPrompts,
} from "./irisXtremeResearch";
import { interrogateModel } from "./modelCrossExamination";
import { computeMateriality } from "./computeMateriality";

describe("IRIS Xtreme 2026 educational expansion", () => {
  it("has exactly 50 curated cases and 16 independent 2026 additions", () => {
    expect(SEEDED_INCIDENTS).toHaveLength(50);
    const newer = SEEDED_INCIDENTS.filter((c) =>
      c.governance.notes?.includes("Independent public-source case")
    );
    expect(newer).toHaveLength(16);
    for (const incident of newer) {
      expect(incident.evidence.length).toBeGreaterThan(0);
      expect(incident.evidence.some((e) => e.linkRole === "deep_link")).toBe(
        true
      );
      expect(incident.limitations?.some((x) => x.includes("Cyentia"))).toBe(
        true
      );
      expect(incident.company.financials?.revenueUSDm).toBeUndefined();
    }
  });
  it("defines five unique guided journeys attached to valid catalog entries", () => {
    expect(GOLDEN_EXAMPLES).toHaveLength(5);
    expect(new Set(GOLDEN_EXAMPLES.map((g) => g.id)).size).toBe(5);
    for (const g of GOLDEN_EXAMPLES) {
      expect(SEEDED_INCIDENTS.some((c) => c.id === g.id)).toBe(true);
      expect(g.sourceQuestion).toBeTruthy();
      expect(g.modelQuestion).toBeTruthy();
      expect(g.decisionQuestion).toBeTruthy();
      expect(g.reveal).toBeTruthy();
    }
  });
  it("preserves all-incident 2025 benchmarks, not an imagined Xtreme conditional distribution", () => {
    expect(IRIS_XTREME_2026.sampleCount).toBe(136);
    expect(irisRevenueBenchmark(null)).toBeNull();
    expect(irisRevenueBenchmark(0)).toBeNull();
    expect(irisRevenueBenchmark(99.9)?.p95USDm).toBe(9.1);
    expect(irisRevenueBenchmark(500)?.p95USDm).toBe(12.3);
    expect(irisRevenueBenchmark(4000)?.p95USDm).toBe(61.8);
    expect(irisRevenueBenchmark(10001)?.p95USDm).toBe(266.2);
    expect(irisRevenueBenchmark(500)?.population).toContain("all-incident");
  });
  it("keeps research lenses explicitly contextual and the financial theft taxonomy auditable", () => {
    expect(
      irisResearchPrompts(["crypto", "financial_theft"])[0]?.title
    ).toContain("Stolen assets");
    const incident = SEEDED_INCIDENTS.find((c) => c.slug === "bybit-2025")!;
    const { inputs, outputs } = computeMateriality(incident);
    const findings = interrogateModel({
      incident,
      inputs,
      outputs,
      stressPercent: 100,
      lefAnnual: 1,
      secondaryProbabilityPercent: 50,
    });
    expect(findings.some((x) => x.id === "unmodeled-direct-theft")).toBe(true);
  });
});
