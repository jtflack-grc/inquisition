import { describe, expect, it } from "vitest";
import { GOLDEN_EXAMPLES } from "../inquisition/goldenExamples";
import { SEEDED_INCIDENTS } from "../inquisition/seedIncidents";
import { visibleGlobeCases } from "./globeCaseSelection";

describe("Lite 3D globe case selection", () => {
  it("keeps all geolocated cases in the full globe", () => {
    const full = visibleGlobeCases(SEEDED_INCIDENTS, "full");
    expect(full).toHaveLength(50);
    expect(new Set(full.map((item) => item.id)).size).toBe(full.length);
  });

  it("shows only five curated teaching cases, in the walkthrough order", () => {
    const lite = visibleGlobeCases(SEEDED_INCIDENTS, "lite");
    expect(lite.map((item) => item.id)).toEqual(
      GOLDEN_EXAMPLES.map((item) => item.id)
    );
    for (const item of lite) {
      expect(Number.isFinite(item.company.hqLat)).toBe(true);
      expect(Number.isFinite(item.company.hqLon)).toBe(true);
    }
  });

  it("omits missing and invalid locations instead of plotting phantom pins", () => {
    const lite = visibleGlobeCases(
      SEEDED_INCIDENTS.filter((item) => item.id !== GOLDEN_EXAMPLES[0]?.id),
      "lite"
    );
    expect(lite).toHaveLength(4);
    expect(lite.some((item) => item.id === GOLDEN_EXAMPLES[0]?.id)).toBe(false);
    const malformed = SEEDED_INCIDENTS.map((item) =>
      item.id === GOLDEN_EXAMPLES[1]?.id
        ? { ...item, company: { ...item.company, hqLat: Number.NaN } }
        : item
    );
    expect(visibleGlobeCases(malformed, "lite")).toHaveLength(4);
  });
});
