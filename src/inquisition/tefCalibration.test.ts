import { describe, expect, it } from "vitest";
import {
  deriveLefFromTef,
  parseTefEstimateJson,
} from "./tefCalibration";

const source = JSON.stringify({
  scenario: "ransomware",
  profile: "US manufacturing / $100M–$1B",
  estimate_date: "2026-10-28",
  inputs: ["Example source edition; not bundled by INQUISITION"],
  summary: { positioned_median: 0.4 },
  analysis: {
    vectors: [
      { name: "Credential", positioned_median: 0.6 },
      { name: "Exploitation", positioned_median: 0.3 },
      { name: "Phishing", positioned_median: 0.1 },
    ],
  },
});

describe("user imported TEF Estimator JSON", () => {
  it("uses the positioned total TEF rather than summing pre-dampening vector medians", () => {
    const result = parseTefEstimateJson(source);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.estimate.positionedTefMedian).toBe(0.4);
    expect(result.estimate.vectors.map(v => v.shareOfRawVectors)).toEqual([0.6, 0.3, 0.1]);
    expect(deriveLefFromTef(result.estimate, [20, 50, 10])).toBeCloseTo(0.4 * (0.6 * 0.2 + 0.3 * 0.5 + 0.1 * 0.1), 8);
    expect(deriveLefFromTef(result.estimate, [100, 100, 100])).toBeCloseTo(0.4);
    expect(deriveLefFromTef(result.estimate, [0, 0, 0])).toBe(0);
  });
  it("does not silently convert missing susceptibility to zero", () => {
    const result = parseTefEstimateJson(source);
    if (!result.ok) throw Error("fixture invalid");
    expect(deriveLefFromTef(result.estimate, [null, 50, 5])).toBeNull();
    expect(deriveLefFromTef(result.estimate, [20, 50])).toBeNull();
    expect(deriveLefFromTef(result.estimate, [101, 0, 0])).toBeNull();
    expect(deriveLefFromTef(result.estimate, [-1, 0, 0])).toBeNull();
  });
  it("rejects malformed and incompatible export schemas", () => {
    expect(parseTefEstimateJson("{").ok).toBe(false);
    expect(parseTefEstimateJson("{}").ok).toBe(false);
    expect(parseTefEstimateJson(JSON.stringify({summary:{positioned_median:0.2}})).ok).toBe(false);
    expect(parseTefEstimateJson(" ".repeat(250001)).ok).toBe(false);
  });
});
