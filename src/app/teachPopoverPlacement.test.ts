import { describe, expect, it } from "vitest";
import { positionTeachPopover } from "./teachPopoverPlacement";

describe("global teachable popover placement", () => {
  it("places the popup below a top-of-rail trigger inside the viewport", () => {
    const pos = positionTeachPopover(
      { left: 410, right: 440, top: 44, bottom: 72 },
      1200,
      800,
      220
    );
    expect(pos.side).toBe("below");
    expect(pos.left).toBe(410);
    expect(pos.top).toBe(80);
    expect(pos.maxHeight).toBeGreaterThan(220);
  });

  it("opens above a low trigger and clamps to the viewport right edge", () => {
    const pos = positionTeachPopover(
      { left: 1090, right: 1120, top: 725, bottom: 753 },
      1200,
      800,
      220
    );
    expect(pos.side).toBe("above");
    expect(pos.left).toBe(868);
    expect(pos.top).toBe(497);
    expect(pos.width).toBe(320);
  });

  it("fits narrow and short screens without leaking off screen", () => {
    const pos = positionTeachPopover(
      { left: 260, right: 288, top: 110, bottom: 138 },
      300,
      240,
      230
    );
    expect(pos.width).toBe(276);
    expect(pos.left).toBe(12);
    expect(pos.side).toBe("below");
    expect(pos.maxHeight).toBe(82);
    expect(pos.top).toBe(146);
  });
});
