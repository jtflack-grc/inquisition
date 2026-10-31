import { computeMateriality } from "./computeMateriality";
import type { Incident, MaterialityOutputs, MaterialityOverrides } from "./types";

/**
 * Lite does not estimate losses already incurred by the named victim.
 * It borrows the full model's formulas for a clearly fictional $500M
 * company with a 15% EBITDA/revenue margin proxy.
 */
export const LITE_REVENUE_USDM = 500;
export const LITE_EBITDA_USDM = 75;
export const LITE_DIRECT_THEFT_EXAMPLE_USDM = 1500;

export interface LiteInputs {
  downtimeDays: number;
  recordsMillions: number;
  /** Counterfactual recovery of a stated *gross* theft. Does not enter full LM. */
  recoveredTheftPct: number;
}

export function isDirectTheftExample(incident: Incident): boolean {
  return incident.id === "inc_bybit_2025";
}

export function defaultLiteInputs(incident: Incident): LiteInputs {
  return {
    downtimeDays: Math.min(30, Math.max(0, incident.modelingDefaults?.downtimeDays ?? (incident.taxonomyTags.includes("outage") ? 5 : 0))),
    recordsMillions: Math.min(50, Math.max(0, incident.modelingDefaults?.recordsMillions ?? (incident.taxonomyTags.includes("data_exfiltration") ? 2 : 0))),
    recoveredTheftPct: 0,
  };
}

export function clampLiteInputs(input: LiteInputs): LiteInputs {
  const finite = (value: number, max: number) =>
    Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
  return {
    downtimeDays: finite(input.downtimeDays, 30),
    recordsMillions: finite(input.recordsMillions, 50),
    recoveredTheftPct: finite(input.recoveredTheftPct, 100),
  };
}

export function liteOverrides(input: LiteInputs): MaterialityOverrides {
  const safe = clampLiteInputs(input);
  return {
    revenueUSDm: LITE_REVENUE_USDM,
    ebitdaUSDm: LITE_EBITDA_USDM,
    downtimeDays: safe.downtimeDays,
    recordsMillions: safe.recordsMillions,
  };
}

export function calculateLiteScenario(incident: Incident, input: LiteInputs): {
  inputs: LiteInputs;
  outputs: MaterialityOutputs | null;
  /** This is arithmetic, NOT the full model's loss magnitude. */
  unrecoveredAssetExposureUSDm: number | null;
} {
  const safe = clampLiteInputs(input);
  if (isDirectTheftExample(incident)) {
    return {
      inputs: safe,
      outputs: null,
      unrecoveredAssetExposureUSDm:
        LITE_DIRECT_THEFT_EXAMPLE_USDM * (1 - safe.recoveredTheftPct / 100),
    };
  }
  return {
    inputs: safe,
    outputs: computeMateriality(incident, liteOverrides(safe)).outputs,
    unrecoveredAssetExposureUSDm: null,
  };
}

export type LiteDecisionId = "recovery" | "records" | "evidence";

export const LITE_DECISION_OPTIONS: ReadonlyArray<{
  id: LiteDecisionId;
  title: string;
  description: string;
}> = [
  {
    id: "recovery",
    title: "Test faster recovery",
    description: "What if disruption duration were 25% shorter? A hypothesis, not an assured control benefit.",
  },
  {
    id: "records",
    title: "Test data minimization",
    description: "What if affected-record scope were 25% smaller? This adjusts one model component only.",
  },
  {
    id: "evidence",
    title: "Improve the evidence",
    description: "Keep assumptions unchanged. Identify the source or control test needed before making a claim.",
  },
];

export function liteCounterfactual(
  input: LiteInputs,
  selected: LiteDecisionId,
  isTheft: boolean
): LiteInputs {
  const safe = clampLiteInputs(input);
  if (isTheft) {
    // An independently labeled asset recovery what-if; no claimed
    // correspondence to a control or a category in full model.
    return selected === "recovery"
      ? { ...safe, recoveredTheftPct: Math.min(100, safe.recoveredTheftPct + 25) }
      : safe;
  }
  if (selected === "recovery") return { ...safe, downtimeDays: Number((safe.downtimeDays * 0.75).toFixed(1)) };
  if (selected === "records") return { ...safe, recordsMillions: Number((safe.recordsMillions * 0.75).toFixed(1)) };
  return safe;
}
