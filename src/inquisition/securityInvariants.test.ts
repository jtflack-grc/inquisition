import { describe, expect, it } from "vitest";
import { SEEDED_INCIDENTS } from "./seedIncidents";

describe("publication security invariants", () => {
  it("uses unique incident and evidence identifiers", () => {
    const incidentIds = SEEDED_INCIDENTS.map((incident) => incident.id);
    expect(new Set(incidentIds).size).toBe(incidentIds.length);

    for (const incident of SEEDED_INCIDENTS) {
      const evidenceIds = incident.evidence.map((evidence) => evidence.id);
      expect(new Set(evidenceIds).size).toBe(evidenceIds.length);
    }
  });

  it("permits only HTTPS evidence and filing destinations", () => {
    for (const incident of SEEDED_INCIDENTS) {
      const urls = [
        ...incident.evidence.map((evidence) => evidence.url),
        ...(incident.company.financials?.filingUrl
          ? [incident.company.financials.filingUrl]
          : []),
      ];

      for (const value of urls) {
        const url = new URL(value);
        expect(url.protocol, `${incident.id}: ${value}`).toBe("https:");
        expect(url.username, `${incident.id}: ${value}`).toBe("");
        expect(url.password, `${incident.id}: ${value}`).toBe("");
      }
    }
  });
});
