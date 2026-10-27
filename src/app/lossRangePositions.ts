import type { Range3 } from "../inquisition/types";

/** One shared, nonprobabilistic dollar axis for primary and conditional secondary LM. */
export function lossRangePositions(range: Range3, axisMaximum: number) {
  const scale =
    Number.isFinite(axisMaximum) && axisMaximum > 0 ? axisMaximum : 1;
  const pct = (value: number) =>
    Math.max(
      0,
      Math.min(100, ((Number.isFinite(value) ? value : 0) / scale) * 100)
    );
  const low = pct(range.min);
  const mode = pct(range.mostLikely);
  const high = pct(range.max);
  return { low, mode, high, span: Math.max(0, high - low) };
}
