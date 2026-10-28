import { describe, expect, it } from "vitest";
import {
  annualChanceOfOneExceedingEvent,
  boundedIllustrativeLef,
  chanceAtLeastOneEvent,
  conditionalExceedanceProbability,
  runReproducibleRiskSimulation,
  seedForIncident,
  simulateAnnualAggregate,
} from "./lossExceedance";
import { mulberry32 } from "./fairLmMonteCarlo";
import type { CategoryEstimate } from "./types";

const categories: CategoryEstimate[] = [
  {
    category: "business_interruption",
    kind: "primary",
    rangeUSDm: { min: 10, mostLikely: 20, max: 30 },
    provenance: { label: "case", formula: "assumed", inputs: {} },
  },
  {
    category: "reputational_damage",
    kind: "secondary",
    rangeUSDm: { min: 0, mostLikely: 5, max: 10 },
    provenance: { label: "case", formula: "assumed", inputs: {} },
  },
];

describe("FAIR event-frequency boundary", () => {
  it("converts an explicitly assumed Poisson annual rate into event probability", () => {
    expect(chanceAtLeastOneEvent(0)).toBe(0);
    expect(chanceAtLeastOneEvent(0.1)).toBeCloseTo(0.09516258, 6);
    expect(chanceAtLeastOneEvent(1)).toBeCloseTo(0.63212056, 6);
    expect(boundedIllustrativeLef(-2)).toBe(0);
    expect(boundedIllustrativeLef(100)).toBe(10);
    expect(boundedIllustrativeLef(Number.NaN)).toBe(0);
  });

  it("keeps one-event severity probability separate from annual probability", () => {
    const conditional = conditionalExceedanceProbability([0, 2, 5, 10], 2);
    expect(conditional).toBe(0.5);
    expect(annualChanceOfOneExceedingEvent(0.1, conditional)).toBeCloseTo(
      1 - Math.exp(-0.05)
    );
    expect(annualChanceOfOneExceedingEvent(0, conditional)).toBe(0);
    expect(annualChanceOfOneExceedingEvent(1, 0)).toBe(0);
  });
});

describe("compound-Poisson annual loss sketch", () => {
  it("has a zero P90 for a rare fixed-cost event but a nonzero P95", () => {
    const annual = simulateAnnualAggregate(
      [20],
      0.1,
      100_000,
      mulberry32(42)
    );
    expect(annual.p90).toBe(0);
    expect(annual.p95).toBe(20);
    expect(annual.mean).toBeCloseTo(2, 1);
    expect(annual.zeroEventYearShare).toBeGreaterThan(0.9);
  });

  it("returns zero annual loss when annual event frequency is zero", () => {
    const annual = simulateAnnualAggregate(
      [25],
      0,
      2000,
      mulberry32(31)
    );
    expect(annual.mean).toBe(0);
    expect(annual.p90).toBe(0);
    expect(annual.zeroEventYearShare).toBe(1);
  });

  it("is reproducible and keeps a nonincreasing event-exceedance curve", () => {
    const seed = seedForIncident("inc_moveit_supply_chain_2023");
    const params = {
      categories,
      insuranceOffsetUSDm: 3,
      iterations: 5000,
      secondaryEventProbability: 0.5,
      lefAnnual: 0.4,
      seed,
    };
    const a = runReproducibleRiskSimulation(params);
    const b = runReproducibleRiskSimulation(params);
    expect(a).toEqual(b);
    expect(a.perEventExceedance).toHaveLength(33);
    for (let i = 1; i < a.perEventExceedance.length; i += 1) {
      expect(a.perEventExceedance[i]!.probability).toBeLessThanOrEqual(
        a.perEventExceedance[i - 1]!.probability
      );
    }
    expect(a.annualAggregate.mean).toBeCloseTo(
      a.perEvent.totalLmUsdM.mean * 0.4,
      0
    );
    expect(a.annualAggregate.p90).toBeGreaterThanOrEqual(0);
  });
});
