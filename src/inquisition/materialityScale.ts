import type { CategoryEstimate, MaterialityOutputs, Range3 } from "./types";

export function scaleRange3(r: Range3, factor: number): Range3 {
  if (!Number.isFinite(factor) || factor <= 0) return r;
  return {
    min: r.min * factor,
    mostLikely: r.mostLikely * factor,
    max: r.max * factor,
  };
}

export function scaleMaterialityOutputs(
  outputs: MaterialityOutputs,
  factor: number,
  insuranceRecoveryUSDm = 0
): MaterialityOutputs {
  const grossPrimaryTotalUSDm = scaleRange3(
    outputs.grossPrimaryTotalUSDm,
    factor
  );
  const recovery = Math.max(0, insuranceRecoveryUSDm);
  return {
    ...outputs,
    grossPrimaryTotalUSDm,
    primaryTotalUSDm: {
      min: Math.max(0, grossPrimaryTotalUSDm.min - recovery),
      mostLikely: Math.max(0, grossPrimaryTotalUSDm.mostLikely - recovery),
      max: Math.max(0, grossPrimaryTotalUSDm.max - recovery),
    },
    secondaryTotalUSDm: scaleRange3(outputs.secondaryTotalUSDm, factor),
    categories: outputs.categories.map((c): CategoryEstimate => ({
      ...c,
      rangeUSDm: scaleRange3(c.rangeUSDm, factor),
    })),
  };
}
