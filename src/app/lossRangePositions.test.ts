import { describe, expect, it } from "vitest";
import { lossRangePositions } from "./lossRangePositions";

describe("loss-range shared axis", () => {
  it("places comparable loss magnitudes on a common scale", () => {
    expect(lossRangePositions({ min: 5, mostLikely: 10, max: 20 }, 40)).toEqual({
      low: 12.5,
      mode: 25,
      high: 50,
      span: 37.5,
    });
  });
  it("handles zero, invalid axis and negative inputs without invalid CSS positions", () => {
    expect(lossRangePositions({ min: 0, mostLikely: 0, max: 0 }, 0)).toEqual({
      low: 0, mode: 0, high: 0, span: 0,
    });
    expect(lossRangePositions({ min: -2, mostLikely: 3, max: 200 }, 100)).toEqual({
      low: 0, mode: 3, high: 100, span: 100,
    });
  });
});
