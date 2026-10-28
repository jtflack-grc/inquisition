import { describe, expect, it } from "vitest";
import { SEEDED_INCIDENTS } from "./seedIncidents";
import { computeMateriality } from "./computeMateriality";
import { interrogateModel } from "./modelCrossExamination";
import { parseTefEstimateJson, type AppliedTefCalibration } from "./tefCalibration";

const incident = SEEDED_INCIDENTS[0]!;
const { inputs, outputs } = computeMateriality(incident);

describe("model cross-examination questions", () => {
  function base() {
    return interrogateModel({
      incident,
      inputs,
      outputs,
      stressPercent: 100,
      lefAnnual: 1,
      secondaryProbabilityPercent: 50,
    });
  }
  it("labels assumed frequency and overlap challenges without making an evidence confidence score", () => {
    const questions = base();
    expect(questions.some(q => q.id === "frequency-not-calibrated")).toBe(true);
    expect(questions.some(q => q.id === "loss-bucket-overlap")).toBe(true);
    expect(questions.some(q => q.id === "independence")).toBe(true);
    expect(questions.every(q => q.resolveBy.length > 15)).toBe(true);
    expect(questions.every(q => q.status !== undefined)).toBe(true);
  });
  it("distinguishes scenario changes and hypothetical risk transfer from filed facts", () => {
    const questions = interrogateModel({
      incident,
      inputs: { ...inputs, insuranceOffsetUSDm: 5 },
      outputs,
      overrides: { downtimeDays: 3 },
      stressPercent: 125,
      lefAnnual: 1,
      secondaryProbabilityPercent: 50,
    });
    expect(questions.some(q => q.id === "insurance-response")).toBe(true);
    expect(questions.some(q => q.id === "counterfactual-edits")).toBe(true);
  });
  it("qualifies an imported rate as a present-day analogy, not historic evidence", () => {
    const parsed = parseTefEstimateJson(JSON.stringify({
      scenario: "ransomware",
      profile: "present-day US manufacturing",
      estimate_date: "2026-10-28",
      summary: { positioned_median: 0.5 },
      analysis: { vectors: [{name: "Credential", positioned_median: 0.6 }] }
    }));
    if (!parsed.ok) throw Error("fixture invalid");
    const tefCalibration: AppliedTefCalibration = {
      estimate: parsed.estimate,
      susceptibilityPct: [20],
      derivedLefAnnual: 0.1,
      acknowledgedPresentDayAnalogy: true,
      source: "user-imported-voicu-jones-tef-json"
    };
    const questions = interrogateModel({
      incident,
      inputs,
      outputs,
      stressPercent: 100,
      lefAnnual: 0.1,
      secondaryProbabilityPercent: 50,
      tefCalibration
    });
    expect(questions.some(q => q.id === "frequency-not-calibrated")).toBe(false);
    expect(questions.find(q => q.id === "tef-analogy")?.observed).toContain("NOT a historical");
  });
});
