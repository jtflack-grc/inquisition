import { describe, expect, it } from "vitest";
import { computeMateriality } from "./computeMateriality";
import {
  buildMaterialityExportPayload,
  insuranceOffsetUSDmFromInputs,
  normalizeExportForSnapshot,
} from "./materialityExportPayload";
import { SEEDED_INCIDENTS } from "./seedIncidents";

describe("buildMaterialityExportPayload", () => {
  const incident = SEEDED_INCIDENTS[0]!;
  const { inputs, outputs } = computeMateriality(incident, undefined);
  const outputsDisplayed = outputs;

  it("shape for basic tab (stable contract)", () => {
    const payload = buildMaterialityExportPayload({
      selected: incident,
      tab: "basic",
      lefAnnual: 1,
      mcIterations: 10_000,
      secondaryEventProbabilityPct: 50,
      sectorPreset: "neutral",
      stressPct: 100,
      inputs,
      outputs,
      outputsDisplayed,
    });
    const n = normalizeExportForSnapshot(payload);
    expect(n.app).toBe("INQUISITION");
    expect(n.exportedAt).toBe("<iso-timestamp>");
    expect(n.incident).toMatchObject({
      id: incident.id,
      slug: incident.slug,
      title: incident.incidentTitle,
    });
    const mat = n.materiality as Record<string, unknown>;
    expect(mat.viewTab).toBe("basic");
    expect(mat.lefAnnual).toBeUndefined();
    expect(mat.monteCarlo).toBeUndefined();
    expect(mat.sectorPreset).toBe("neutral");
    expect(mat.stressPercent).toBe(100);
    expect(mat.disclaimer).toContain("Estimate and Assumptions");
    expect(Array.isArray(n.evidenceIndex)).toBe(true);
  });

  it("fair_native tab includes monteCarlo and lefAnnual", () => {
    const payload = buildMaterialityExportPayload({
      selected: incident,
      tab: "fair_native",
      lefAnnual: 0.5,
      mcIterations: 2000,
      secondaryEventProbabilityPct: 40,
      sectorPreset: "financial",
      stressPct: 110,
      inputs,
      outputs,
      outputsDisplayed,
    });
    const mat = payload.materiality as {
      viewTab: string;
      lefAnnual: number;
      monteCarlo: { iterations: number; totalLmUsdM: { p50: number } };
    };
    expect(mat.viewTab).toBe("fair_native");
    expect(mat.lefAnnual).toBe(0.5);
    expect(mat.monteCarlo.iterations).toBe(2000);
    expect(typeof mat.monteCarlo.totalLmUsdM.p50).toBe("number");
  });

  it("insuranceOffsetUSDmFromInputs", () => {
    expect(
      insuranceOffsetUSDmFromInputs({ ...inputs, insuranceOffsetUSDm: null })
    ).toBe(0);
    expect(
      insuranceOffsetUSDmFromInputs({ ...inputs, insuranceOffsetUSDm: 12 })
    ).toBe(12);
  });
});
