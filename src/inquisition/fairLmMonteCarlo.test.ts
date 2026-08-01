import { describe, expect, it } from "vitest";
import {
  mulberry32,
  runLossMagnitudeMonteCarlo,
  triangularSample,
} from "./fairLmMonteCarlo";
import type { CategoryEstimate } from "./types";

describe("triangularSample", () => {
  it("matches known mean for symmetric triangle (min=0, mode=1, max=2)", () => {
    const rnd = mulberry32(42);
    const n = 80_000;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += triangularSample(0, 1, 2, rnd);
    }
    const mean = sum / n;
    expect(mean).toBeGreaterThan(0.95);
    expect(mean).toBeLessThan(1.05);
  });
});

describe("runLossMagnitudeMonteCarlo", () => {
  const fakeCats: CategoryEstimate[] = [
    {
      category: "information_privacy",
      kind: "primary",
      rangeUSDm: { min: 10, mostLikely: 20, max: 30 },
      provenance: { label: "t", formula: "t", inputs: {} },
    },
    {
      category: "reputational_damage",
      kind: "secondary",
      rangeUSDm: { min: 0, mostLikely: 5, max: 10 },
      provenance: { label: "t", formula: "t", inputs: {} },
    },
  ];

  it("is deterministic with seeded RNG", () => {
    const a = runLossMagnitudeMonteCarlo(fakeCats, 0, 5000, mulberry32(99));
    const b = runLossMagnitudeMonteCarlo(fakeCats, 0, 5000, mulberry32(99));
    expect(a.totalLmUsdM.p50).toBe(b.totalLmUsdM.p50);
    expect(a.primaryLmUsdM.mean).toBe(b.primaryLmUsdM.mean);
  });

  it("reduces primary LM when insurance offset applies", () => {
    const noIns = runLossMagnitudeMonteCarlo(fakeCats, 0, 8000, mulberry32(7));
    const withIns = runLossMagnitudeMonteCarlo(
      fakeCats,
      15,
      8000,
      mulberry32(7)
    );
    expect(withIns.primaryLmUsdM.mean).toBeLessThan(noIns.primaryLmUsdM.mean);
  });

  it("applies conditional secondary-event probability", () => {
    const never = runLossMagnitudeMonteCarlo(
      fakeCats,
      0,
      8000,
      mulberry32(11),
      0
    );
    const always = runLossMagnitudeMonteCarlo(
      fakeCats,
      0,
      8000,
      mulberry32(11),
      1
    );
    expect(never.secondaryLmUsdM.mean).toBe(0);
    expect(always.secondaryLmUsdM.mean).toBeGreaterThan(0);
  });
});
