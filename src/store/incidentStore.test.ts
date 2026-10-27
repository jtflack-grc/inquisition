import { afterEach, describe, expect, it } from "vitest";
import { SEEDED_INCIDENTS } from "../inquisition/seedIncidents";
import { useIncidentStore } from "./incidentStore";

const firstCaseId = SEEDED_INCIDENTS[0].id;
const nextCaseId = SEEDED_INCIDENTS[1].id;

afterEach(() => {
  useIncidentStore.setState({
    selectedIncidentId: firstCaseId,
    scenarioStressPct: 100,
  });
});

describe("shared scenario stress", () => {
  it("is shared and resets when the selected case changes", () => {
    useIncidentStore.getState().setSelectedIncidentId(firstCaseId);
    useIncidentStore.getState().setScenarioStressPct(135);
    expect(useIncidentStore.getState().scenarioStressPct).toBe(135);

    useIncidentStore.getState().setSelectedIncidentId(nextCaseId);
    expect(useIncidentStore.getState().scenarioStressPct).toBe(100);
    expect(useIncidentStore.getState().selectedIncidentId).toBe(nextCaseId);
  });

  it("rejects invalid stress values without changing a scenario", () => {
    useIncidentStore.getState().setScenarioStressPct(120);
    useIncidentStore.getState().setScenarioStressPct(Number.NaN);
    useIncidentStore.getState().setScenarioStressPct(0);
    useIncidentStore.getState().setScenarioStressPct(10000);
    expect(useIncidentStore.getState().scenarioStressPct).toBe(120);
  });

  it("does not reset when selecting the already selected case", () => {
    useIncidentStore.getState().setSelectedIncidentId(firstCaseId);
    useIncidentStore.getState().setScenarioStressPct(110);
    useIncidentStore.getState().setSelectedIncidentId(firstCaseId);
    expect(useIncidentStore.getState().scenarioStressPct).toBe(110);
  });
});
