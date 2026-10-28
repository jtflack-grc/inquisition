import {
  runReproducibleRiskSimulation,
  seedForIncident,
} from "./lossExceedance";
import type {
  Incident,
  MaterialityInputs,
  MaterialityOutputs,
  MaterialityOverrides,
} from "./types";
import type { MaterialityViewTab } from "./materialityViewTab";
import type { AppliedTefCalibration } from "./tefCalibration";
import { interrogateModel } from "./modelCrossExamination";

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
  simulationSeed?: number;
  tefCalibration?: AppliedTefCalibration | null;
  overrides?: MaterialityOverrides;
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
    simulationSeed,
    tefCalibration,
    overrides,
    secondaryEventProbabilityPct,
    sectorPreset,
    stressPct,
    inputs,
    outputs,
    outputsDisplayed,
  } = params;

  const run =
    tab === "fair_native"
      ? runReproducibleRiskSimulation({
          categories: outputsDisplayed.categories,
          insuranceOffsetUSDm: insuranceOffsetUSDmFromInputs(inputs),
          iterations: mcIterations,
          secondaryEventProbability: secondaryEventProbabilityPct / 100,
          lefAnnual,
          seed: simulationSeed ?? seedForIncident(selected.id),
        })
      : undefined;

  // Preserve the original per-event summary fields for existing JSON readers.
  // Append explicitly separate conditional exceedance and annual aggregates.
  const mcSummary = run
    ? {
        ...run.perEvent,
        modelVersion: run.modelVersion,
        seed: run.seed,
        perEventExceedance: run.perEventExceedance,
        annualAggregate: run.annualAggregate,
        chanceAtLeastOneEvent: run.chanceAtLeastOneEvent,
      }
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
      modelCrossExamination:
        tab !== "basic"
          ? interrogateModel({
              incident: selected,
              inputs,
              outputs: outputsDisplayed,
              overrides,
              stressPercent: stressPct,
              lefAnnual,
              secondaryProbabilityPercent: secondaryEventProbabilityPct,
              tefCalibration,
            })
          : undefined,
      tefCalibration:
        tab === "fair_native" && tefCalibration ? tefCalibration : undefined,
      frequencyProvenance:
        tab === "fair_native"
          ? {
              definition: "Loss Event Frequency (LEF), not attempted TEF",
              basis: tefCalibration
                ? "user-imported external TEF median and independently elicited susceptibility"
                : "user-entered illustrative assumption",
              calibration: tefCalibration
                ? "prospective analogy point estimate; no TEF uncertainty propagation"
                : "none",
              observationWindow: null,
              sourcePopulation: tefCalibration?.estimate.profile ?? null,
              eventModel: "constant-rate independent Poisson",
              ratePerYear: run?.lefAnnual,
              estimateDate: tefCalibration?.estimate.estimateDate ?? null,
              scenario: tefCalibration?.estimate.scenario ?? null,
              comparator: "Voicu and Jones TEF Estimator 1.3.0, reference only",
              comparatorUrl:
                "https://github.com/security-decision-science/security-decision-labs/tree/main/tools/tef-estimator",
              note: "Historical curated incidents do not establish a risk population or TEF denominator.",
            }
          : undefined,
      sectorPreset,
      stressPercent: stressPct,
      inputs,
      outputsBase: outputs,
      outputsStressed: outputsDisplayed,
      disclaimer:
        tab === "fair_native"
          ? "Deterministic seeded simulation of conditional per-event triangular loss magnitude, with an optional illustrative compound-Poisson annual loss distribution. Frequency is user assumed; no empirical TEF or susceptibility is inferred from this retrospective library. Independent loss buckets and events are modeled without correlation or a full FAIR factor tree. Not FAIR Institute–certified analysis or legal, investment, or actuarial advice."
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
