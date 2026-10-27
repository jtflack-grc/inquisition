import { describe, expect, it } from "vitest";
import { resolveMapPlacard } from "./globeCasePlacard";

const first = { id: "first", company: "Example One" };
const second = { id: "second", company: "Example Two" };

describe("globe case placard", () => {
  it("shows the selected first case without requiring a hover", () => {
    expect(resolveMapPlacard(first, null)).toEqual({
      incident: first,
      isPreview: false,
    });
  });

  it("previews an unselected hovered case without changing selection", () => {
    expect(resolveMapPlacard(first, second)).toEqual({
      incident: second,
      isPreview: true,
    });
    expect(resolveMapPlacard(first, null)?.incident).toBe(first);
  });

  it("treats hovering the active case as active, not a preview", () => {
    expect(resolveMapPlacard(first, first)).toEqual({
      incident: first,
      isPreview: false,
    });
  });

  it("does not show a placard until an incident exists", () => {
    expect(resolveMapPlacard(null, null)).toBeNull();
  });
});
