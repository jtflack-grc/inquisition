/** Geometry-only placement: portal tooltips sit above rail scroll/stacking contexts. */
export interface TeachPopoverBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface TeachPopoverPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  side: "above" | "below";
}

const EDGE = 12;
const GAP = 8;
const DESIRED_WIDTH = 320;

/** Place inside the viewport with a preference for the side with room to read. */
export function positionTeachPopover(
  trigger: TeachPopoverBounds,
  viewportWidth: number,
  viewportHeight: number,
  popoverHeight = 226
): TeachPopoverPosition {
  const width = Math.min(DESIRED_WIDTH, Math.max(0, viewportWidth - EDGE * 2));
  const left = Math.max(
    EDGE,
    Math.min(trigger.left, Math.max(EDGE, viewportWidth - EDGE - width))
  );
  const below = Math.max(0, viewportHeight - trigger.bottom - EDGE - GAP);
  const above = Math.max(0, trigger.top - EDGE - GAP);
  const side = below < popoverHeight && above > below ? "above" : "below";
  const available = side === "above" ? above : below;
  const maxHeight = Math.max(0, available);
  const contentHeight = Math.min(popoverHeight, maxHeight);
  const top =
    side === "above"
      ? Math.max(EDGE, trigger.top - GAP - contentHeight)
      : Math.min(viewportHeight - EDGE, trigger.bottom + GAP);

  return { top, left, width, maxHeight, side };
}
