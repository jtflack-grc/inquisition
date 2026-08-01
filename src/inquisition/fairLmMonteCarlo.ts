import type { CategoryEstimate } from "./types";

/** Summary statistics for one tail of the LM distribution (USD millions). */
export type LmStatBlock = {
  mean: number;
  p10: number;
  p50: number;
  p90: number;
};

export type MonteCarloLmSummary = {
  iterations: number;
  secondaryEventProbability: number;
  grossPrimaryLmUsdM: LmStatBlock;
  /** Gross primary loss less the entered recovery assumption, floored at zero. */
  primaryLmUsdM: LmStatBlock;
  secondaryLmUsdM: LmStatBlock;
  totalLmUsdM: LmStatBlock;
};

/** Mulberry32 — deterministic PRNG for tests / reproducible demos. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sample from triangular(min, mode, max). If degenerate, returns clamped mode.
 */
export function triangularSample(
  min: number,
  mode: number,
  max: number,
  rnd: () => number
): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  let m = mode;
  if (m < lo) m = lo;
  if (m > hi) m = hi;
  if (hi <= lo) return lo;
  const u = rnd();
  const fc = (m - lo) / (hi - lo);
  if (u <= fc) {
    return lo + Math.sqrt(u * (hi - lo) * (m - lo));
  }
  return hi - Math.sqrt((1 - u) * (hi - lo) * (hi - m));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  const w = idx - lo;
  return sorted[lo]! * (1 - w) + sorted[hi]! * w;
}

function summarize(samples: number[]): LmStatBlock {
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return {
    mean,
    p10: percentile(sorted, 0.1),
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
  };
}

/**
 * Monte Carlo over **Loss Magnitude (LM)** only: each category is an independent triangular(min, mode, max)
 * from the deterministic bridge (after any UI scaling). Primary categories are summed, then a flat
 * insurance offset is subtracted from primary LM (same spirit as the deterministic aggregate).
 *
 * Secondary loss is conditional on an outside-party reaction. `secondaryEventProbability` is the probability
 * that the modeled primary event produces that reaction. The model does not correlate cost buckets or perform
 * a full FAIR LEF decomposition.
 */
export function runLossMagnitudeMonteCarlo(
  categories: CategoryEstimate[],
  insuranceOffsetUSDm: number,
  iterations: number,
  rnd: () => number = Math.random,
  secondaryEventProbability = 1
): MonteCarloLmSummary {
  const offset = Math.max(0, insuranceOffsetUSDm);
  const secondaryProbability = Math.min(
    1,
    Math.max(0, secondaryEventProbability)
  );
  const grossPrimarySamples: number[] = [];
  const primarySamples: number[] = [];
  const secondarySamples: number[] = [];
  const totalSamples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let primary = 0;
    let secondary = 0;
    for (const c of categories) {
      const x = triangularSample(
        c.rangeUSDm.min,
        c.rangeUSDm.mostLikely,
        c.rangeUSDm.max,
        rnd
      );
      if (c.kind === "primary") primary += x;
      else secondary += x;
    }
    const primaryAdj = Math.max(0, primary - Math.min(primary, offset));
    const secondaryRealized = rnd() < secondaryProbability ? secondary : 0;
    grossPrimarySamples.push(primary);
    primarySamples.push(primaryAdj);
    secondarySamples.push(secondaryRealized);
    totalSamples.push(primaryAdj + secondaryRealized);
  }

  return {
    iterations,
    secondaryEventProbability: secondaryProbability,
    grossPrimaryLmUsdM: summarize(grossPrimarySamples),
    primaryLmUsdM: summarize(primarySamples),
    secondaryLmUsdM: summarize(secondarySamples),
    totalLmUsdM: summarize(totalSamples),
  };
}
