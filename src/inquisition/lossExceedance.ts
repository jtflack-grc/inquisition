import { mulberry32, runLossMagnitudeMonteCarlo, type LmStatBlock, type MonteCarloLmSummary } from "./fairLmMonteCarlo";
import type { CategoryEstimate } from "./types";

export const MAX_ILLUSTRATIVE_LEF = 10;
export const SIMULATION_MODEL_VERSION = "2026-10-28-fair-separation-v1";

export interface ExceedancePoint {
  thresholdUSDm: number;
  probability: number;
}

export interface AnnualLossSummary extends LmStatBlock {
  p95: number;
  zeroEventYearShare: number;
}

export interface ReproducibleRiskSimulation {
  modelVersion: string;
  seed: number;
  iterations: number;
  lefAnnual: number;
  perEvent: MonteCarloLmSummary;
  perEventExceedance: ExceedancePoint[];
  annualAggregate: AnnualLossSummary;
  chanceAtLeastOneEvent: number;
}

/** Stable seed from a case identifier; not an empirical model calibration. */
export function seedForIncident(incidentId: string): number {
  let hash = 2166136261;
  for (let i = 0; i < incidentId.length; i += 1) {
    hash = Math.imul(hash ^ incidentId.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

export function boundedIllustrativeLef(rate: number): number {
  if (!Number.isFinite(rate)) return 0;
  return Math.max(0, Math.min(MAX_ILLUSTRATIVE_LEF, rate));
}

/** Annual probability of at least one modeled event, conditional on constant-rate Poisson arrivals. */
export function chanceAtLeastOneEvent(rate: number): number {
  return -Math.expm1(-boundedIllustrativeLef(rate));
}

/** Strictly greater than the threshold, conditional on a realized modeled event. */
export function conditionalExceedanceProbability(samples: number[], thresholdUSDm: number): number {
  if (samples.length === 0) return 0;
  const threshold = Math.max(0, thresholdUSDm);
  let exceed = 0;
  for (const value of samples) {
    if (value > threshold) exceed += 1;
  }
  return exceed / samples.length;
}

/**
 * P(>=1 event exceeding threshold in 12 months). This is NOT the probability
 * that the annual sum of event losses exceeds the threshold.
 */
export function annualChanceOfOneExceedingEvent(rate: number, conditionalChance: number): number {
  return -Math.expm1(-boundedIllustrativeLef(rate) * Math.max(0, Math.min(1, conditionalChance)));
}

function percentile(sorted: number[], fraction: number): number {
  if (!sorted.length) return 0;
  const index = fraction * (sorted.length - 1);
  const lo = Math.floor(index);
  const hi = Math.ceil(index);
  const weight = index - lo;
  return sorted[lo]! * (1 - weight) + sorted[hi]! * weight;
}

function poissonCount(rate: number, random: () => number): number {
  if (rate <= 0) return 0;
  // Knuth's inverse-product algorithm; rate is deliberately capped at 10/year.
  const limit = Math.exp(-rate);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= random();
  } while (product > limit);
  return count - 1;
}

/**
 * Simple compound-Poisson annual aggregate: events arrive independently,
 * each event's loss is independently resampled from the simulated conditional
 * severity outcomes. Common shocks, overlapping recoveries, annual insurance
 * exhaustion, and correlated events are not represented.
 */
export function simulateAnnualAggregate(
  perEventLossSamples: number[],
  lefAnnual: number,
  iterations: number,
  random: () => number
): AnnualLossSummary {
  const count = Math.max(1, Math.floor(iterations));
  const rate = boundedIllustrativeLef(lefAnnual);
  const samples: number[] = [];
  let zeroEventYears = 0;
  for (let i = 0; i < count; i += 1) {
    const events = poissonCount(rate, random);
    if (events === 0) zeroEventYears += 1;
    let total = 0;
    for (let j = 0; j < events; j += 1) {
      if (perEventLossSamples.length) {
        total += perEventLossSamples[Math.floor(random() * perEventLossSamples.length)] ?? 0;
      }
    }
    samples.push(total);
  }
  samples.sort((a, b) => a - b);
  const mean = samples.reduce((sum, amount) => sum + amount, 0) / count;
  return {
    mean,
    p10: percentile(samples, 0.1),
    p50: percentile(samples, 0.5),
    p90: percentile(samples, 0.9),
    p95: percentile(samples, 0.95),
    zeroEventYearShare: zeroEventYears / count,
  };
}

/**
 * Reproducible learning experiment: per-event LM simulation + compound-Poisson
 * annual aggregation. Seed, rate, scenario inputs and model version travel
 * with JSON exports. This does not infer TEF from selected historical breaches.
 */
export function runReproducibleRiskSimulation(params: {
  categories: CategoryEstimate[];
  insuranceOffsetUSDm: number;
  iterations: number;
  secondaryEventProbability: number;
  lefAnnual: number;
  seed: number;
}): ReproducibleRiskSimulation {
  const iterations = Math.max(1, Math.min(50_000, Math.floor(params.iterations)));
  const seed = params.seed >>> 0;
  const rate = boundedIllustrativeLef(params.lefAnnual);
  const samples: number[] = [];
  const perEvent = runLossMagnitudeMonteCarlo(
    params.categories,
    params.insuranceOffsetUSDm,
    iterations,
    mulberry32(seed),
    params.secondaryEventProbability,
    samples
  );
  const max = Math.max(0, ...samples);
  const perEventExceedance: ExceedancePoint[] = Array.from({ length: 33 }, (_, index) => {
    const thresholdUSDm = (max * index) / 32;
    return {
      thresholdUSDm,
      probability: conditionalExceedanceProbability(samples, thresholdUSDm),
    };
  });
  const annualAggregate = simulateAnnualAggregate(
    samples,
    rate,
    iterations,
    mulberry32(seed ^ 0x9e3779b9)
  );
  return {
    modelVersion: SIMULATION_MODEL_VERSION,
    seed,
    iterations,
    lefAnnual: rate,
    perEvent,
    perEventExceedance,
    annualAggregate,
    chanceAtLeastOneEvent: chanceAtLeastOneEvent(rate),
  };
}
