import type { Incident } from "./types";

const DEFAULT_LIMITATIONS = [
  "Teaching seed: tie models to primary sources in the left panel—dollar ranges in INQUISITION are illustrative until you substitute filed or actuarial evidence.",
];

function truncateSummary(text: string, maxChars: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars - 1)}…`;
}

/**
 * Breadth pass: every incident gets at least one limitation line and a globe-ready attack summary
 * when curators haven’t supplied `securityLesson.attackMechanism`.
 */
export function enrichIncidentBreadth(inc: Incident): Incident {
  const limitations =
    inc.limitations && inc.limitations.length > 0
      ? inc.limitations
      : [...DEFAULT_LIMITATIONS];

  const hasMechanism = Boolean(inc.securityLesson?.attackMechanism?.trim());

  if (hasMechanism) {
    return { ...inc, limitations };
  }

  const attackMechanism = `${inc.incidentTypeLabel}: ${truncateSummary(inc.incidentSummary, 420)}`;

  return {
    ...inc,
    limitations,
    securityLesson: {
      ...(inc.securityLesson ?? {}),
      attackMechanism,
    },
  };
}
