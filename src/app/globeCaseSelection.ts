import type { Incident } from "../inquisition/types";
import { GOLDEN_EXAMPLES } from "../inquisition/goldenExamples";

/** Full casebook plots the whole library; Lite exposes five intentionally curated locations. */
export function visibleGlobeCases(
  incidents: Incident[],
  mode: "full" | "lite"
): Incident[] {
  const valid = (incident: Incident) =>
    Number.isFinite(incident.company.hqLat) &&
    Number.isFinite(incident.company.hqLon);
  if (mode === "full") return incidents.filter(valid);
  const byId = new Map(incidents.map((incident) => [incident.id, incident]));
  return GOLDEN_EXAMPLES.flatMap((example) => {
    const incident = byId.get(example.id);
    return incident && valid(incident) ? [incident] : [];
  });
}
