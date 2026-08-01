import { runLossMagnitudeMonteCarlo } from "./fairLmMonteCarlo";
import type { Incident, MaterialityInputs, MaterialityOutputs } from "./types";
import type { MaterialityViewTab } from "./materialityViewTab";

export type { MaterialityViewTab };

export function insuranceOffsetUSDmFromInputs(
  inputs: MaterialityInputs
): number {
  return Math.max(0, inputs.insuranceOffsetUSDm ?? 0);
}

/**
 * Stable JSON export shape for tests and integrations. Keep keys stable when changing UI.
 */
export function buildMaterialityExportPayload(params: {
  selected: Incident;
  tab: MaterialityViewTab;
  lefAnnual: number;
  mcIterations: number;
  secondaryEventProbabilityPct: number;
  sectorPreset: string;
  stressPct: number;
  inputs: MaterialityInputs;
  outputs: MaterialityOutputs;
  outputsDisplayed: MaterialityOutputs;
}): Record<string, unknown> {
  const {
    selected,
    tab,
    lefAnnual,
    mcIterations,
    secondaryEventProbabilityPct,
    sectorPreset,
    stressPct,
    inputs,
    outputs,
    outputsDisplayed,
  } = params;

  const mcSummary =
    tab === "fair_native"
      ? runLossMagnitudeMonteCarlo(
          outputsDisplayed.categories,
          insuranceOffsetUSDmFromInputs(inputs),
          mcIterations,
          Math.random,
          secondaryEventProbabilityPct / 100
        )
      : undefined;

  return {
    exportedAt: new Date().toISOString(),
    app: "INQUISITION",
    incident: {
      id: selected.id,
      slug: selected.slug,
      title: selected.incidentTitle,
      governance: selected.governance,
    },
    materiality: {
      viewTab: tab,
      lefAnnual: tab === "fair_native" ? lefAnnual : undefined,
      secondaryEventProbabilityPct:
        tab === "fair_native" ? secondaryEventProbabilityPct : undefined,
      monteCarlo: mcSummary,
      sectorPreset,
      stressPercent: stressPct,
      inputs,
      outputsBase: outputs,
      outputsStressed: outputsDisplayed,
      disclaimer:
        tab === "fair_native"
          ? "Simulation adds independent triangular loss-magnitude sampling, conditional secondary loss and an optional LEF sketch. It is not FAIR Institute–certified analysis or a full factor tree. Not legal, investment, or actuarial advice."
          : "Illustrative teaching bridge to loss magnitude using an original incident-cost taxonomy. Estimate and Assumptions are deterministic; Simulation samples the same ranges. Not legal, investment, or actuarial advice.",
    },
    evidenceIndex: selected.evidence.map((e) => ({
      id: e.id,
      url: e.url,
      trustTier: e.trustTier,
      linkRole: e.linkRole,
      type: e.type,
    })),
  };
}

/** Replace volatile timestamp for snapshot tests. */
export function normalizeExportForSnapshot(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const next = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
  if (typeof next.exportedAt === "string") {
    next.exportedAt = "<iso-timestamp>";
  }
  return next;
}
