import type { Incident, MaterialityInputs, MaterialityOutputs, MaterialityOverrides } from "./types";
import type { AppliedTefCalibration } from "./tefCalibration";

export interface ModelChallenge {
  id: string;
  status: "structural" | "needs-evidence" | "disclosed-assumption";
  question: string;
  observed: string;
  resolveBy: string;
}

/**
 * Mechanically detectable limitations and analyst challenges. These are NOT
 * pass/fail control tests or a synthetic "model confidence score."
 */
export function interrogateModel(params: {
  incident: Incident;
  inputs: MaterialityInputs;
  outputs: MaterialityOutputs;
  overrides?: MaterialityOverrides;
  stressPercent: number;
  lefAnnual: number;
  secondaryProbabilityPercent: number;
  tefCalibration?: AppliedTefCalibration | null;
}): ModelChallenge[] {
  const {
    incident,
    inputs,
    outputs,
    overrides,
    stressPercent,
    lefAnnual,
    secondaryProbabilityPercent,
    tefCalibration,
  } = params;
  const findings: ModelChallenge[] = [];
  const add = (finding: ModelChallenge) => findings.push(finding);
  if (!tefCalibration) {
    add({
      id: "frequency-not-calibrated",
      status: "needs-evidence",
      question: "Is the annual loss-event frequency empirically supported?",
      observed: `The current LEF of ${lefAnnual.toFixed(2)}/year is entered by the analyst. The selected historical case does not provide a frequency denominator.`,
      resolveBy: "For a new, explicitly prospective analogy, import a profile-matched TEF estimate and separately justify susceptibility; otherwise keep LEF labeled as an assumption.",
    });
  } else {
    add({
      id: "tef-analogy",
      status: "disclosed-assumption",
      question: "Does an external TEF profile actually describe this loss scenario?",
      observed: `Imported present-day ${tefCalibration.estimate.scenario} TEF with an analyst-entered susceptibility vector. This is a prospective analogy, NOT a historical case-specific event rate.`,
      resolveBy: "Check geography, revenue band, scenario boundary, access-vector completeness, underlying report date, and susceptibility operating evidence. Avoid calling a positioned median an expected event count.",
    });
  }
  if (incident.evidence.length === 0) {
    add({
      id: "missing-evidence-links",
      status: "structural",
      question: "Can the underlying incident record be verified?",
      observed: "The selected case has no curated source links.",
      resolveBy: "Add and verify a specific primary artifact before presenting case-specific findings.",
    });
  }
  if (inputs.recordsMillions === null || inputs.downtimeDays === null) {
    add({
      id: "missing-incident-scale",
      status: "needs-evidence",
      question: "Are the case's core loss drivers established?",
      observed: `Records: ${inputs.recordsMillions ?? "not supplied"} million; downtime: ${inputs.downtimeDays ?? "not supplied"} days. Missing values are currently treated as zero by parts of the teaching model.`,
      resolveBy: "Distinguish a supported zero from an unknown; obtain scope, outage and reporting evidence before treating the missing loss channel as negligible.",
    });
  }
  if (inputs.revenueUSDm === null || inputs.ebitdaUSDm === null) {
    add({
      id: "financial-proxies",
      status: "needs-evidence",
      question: "Does the model have the financial evidence for interruption loss?",
      observed: `Revenue: ${inputs.revenueUSDm ?? "unavailable"}; EBITDA: ${inputs.ebitdaUSDm ?? "unavailable"} (USD millions). Unavailable values trigger simplified assumptions.`,
      resolveBy: "Use the matching as-of financial filing and an evidenced contribution-margin estimate; EBITDA/revenue is a teaching proxy, not a validated contribution margin.",
    });
  }
  if (inputs.recordsMillions !== null && inputs.recordsMillions > 0) {
    add({
      id: "privacy-unit-cost",
      status: "disclosed-assumption",
      question: "Where did the per-record cost assumption come from?",
      observed: "The privacy-cost bridge uses a fixed $2.4 million per million records plus illustrative uncertainty multipliers, irrespective of sector and incident year.",
      resolveBy: "Replace the unit-rate proxy with relevant itemized case evidence, actual response costs, or a clearly sourced peer estimate. Avoid interpreting the output as filed loss.",
    });
  }
  if ((inputs.insuranceOffsetUSDm ?? 0) > 0) {
    add({
      id: "insurance-response",
      status: "needs-evidence",
      question: "Is risk transfer being credited on a valid coverage basis?",
      observed: `The model subtracts an assumed $${inputs.insuranceOffsetUSDm!.toFixed(1)}M from each primary event, rather than modeling a deductible, claim timing, aggregate cap or exclusion.`,
      resolveBy: "Verify the contractual recovery and ensure primary costs aren't being counted again inside recoveries or secondary loss.",
    });
  }
  if (stressPercent !== 100 || overrides !== undefined) {
    add({
      id: "counterfactual-edits",
      status: "disclosed-assumption",
      question: "Are scenario edits being confused with new incident facts?",
      observed: "Model stress and/or analyst overrides change the displayed loss figures, without modifying the source evidence.",
      resolveBy: "Keep the original and edited assumptions distinct in decisions and exports; cite new supporting evidence before claiming observed change.",
    });
  }
  add({
    id: "loss-bucket-overlap",
    status: "needs-evidence",
    question: "Could primary and secondary loss buckets count the same money?",
    observed: `${outputs.categories.length} independently sampled categories include recovery, interruption, data response and conditional external reaction. Overlap cannot be proven or ruled out from the model alone.`,
    resolveBy: "Map each actual expense, lost contribution and outside-party reaction to one mutually exclusive bucket; check legal costs, churn, remediations and settlement treatment.",
  });
  add({
    id: "secondary-probability",
    status: "disclosed-assumption",
    question: "Has the outside-party reaction probability been calibrated?",
    observed: `The current conditional secondary-event probability is ${secondaryProbabilityPercent}%, entered as a teaching assumption.`,
    resolveBy: "Use scenario-relevant claimant, customer, regulator and contractual evidence. Do not assume that every primary event triggers a secondary loss.",
  });
  add({
    id: "independence",
    status: "disclosed-assumption",
    question: "Are event arrivals and loss categories actually independent?",
    observed: "The simulation uses independent triangular cost buckets and Poisson arrivals. Campaign clustering, common downtime drivers and insurance exhaustion are not modeled.",
    resolveBy: "Stress shared shock, downtime dependency and count dispersion where supported. Laura and Jack's population dispersion estimates do not establish any individual organization's count process.",
  });
  return findings;
}
