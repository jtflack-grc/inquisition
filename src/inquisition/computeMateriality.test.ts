import { describe, expect, it } from "vitest";
import { computeMateriality } from "./computeMateriality";
import { SEEDED_INCIDENTS } from "./seedIncidents";

describe("computeMateriality", () => {
  it("produces ordered, finite ranges for every seeded incident", () => {
    expect(SEEDED_INCIDENTS).toHaveLength(34);

    for (const incident of SEEDED_INCIDENTS) {
      const { outputs } = computeMateriality(incident);
      const ranges = [
        outputs.grossPrimaryTotalUSDm,
        outputs.primaryTotalUSDm,
        outputs.secondaryTotalUSDm,
        ...outputs.categories.map((category) => category.rangeUSDm),
      ];

      for (const range of ranges) {
        expect(Number.isFinite(range.min)).toBe(true);
        expect(Number.isFinite(range.mostLikely)).toBe(true);
        expect(Number.isFinite(range.max)).toBe(true);
        expect(range.min).toBeGreaterThanOrEqual(0);
        expect(range.mostLikely).toBeGreaterThanOrEqual(range.min);
        expect(range.max).toBeGreaterThanOrEqual(range.mostLikely);
      }
    }
  });

  it("keeps gross and retained primary loss distinct when recovery is entered", () => {
    const incident = SEEDED_INCIDENTS[0]!;
    const { outputs } = computeMateriality(incident, {
      insuranceOffsetUSDm: 5,
    });

    expect(outputs.grossPrimaryTotalUSDm.mostLikely).toBeGreaterThanOrEqual(
      outputs.primaryTotalUSDm.mostLikely
    );
  });

  it("keeps extortion at zero until an amount is explicitly entered", () => {
    const incident = SEEDED_INCIDENTS[0]!;
    const base = computeMateriality(incident).outputs.categories.find(
      (category) => category.category === "cyber_extortion"
    );
    const entered = computeMateriality(incident, {
      extortionPaymentUSDm: 4,
    }).outputs.categories.find(
      (category) => category.category === "cyber_extortion"
    );

    expect(base?.rangeUSDm.mostLikely).toBe(0);
    expect(entered?.rangeUSDm).toEqual({ min: 3.2, mostLikely: 4, max: 4.8 });
  });
});
