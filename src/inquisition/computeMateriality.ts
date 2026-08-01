import type {
  CategoryEstimate,
  Incident,
  MaterialityCategory,
  MaterialityInputs,
  MaterialityOutputs,
  MaterialityOverrides,
  Range3,
} from "./types";

function clampRange(r: Range3): Range3 {
  const min = Math.max(0, r.min);
  const mostLikely = Math.max(min, r.mostLikely);
  const max = Math.max(mostLikely, r.max);
  return { min, mostLikely, max };
}

function sumRanges(a: Range3, b: Range3): Range3 {
  return {
    min: a.min + b.min,
    mostLikely: a.mostLikely + b.mostLikely,
    max: a.max + b.max,
  };
}

function usdMillions(n: number) {
  return Math.round(n * 10) / 10;
}

function deriveInputs(incident: Incident): MaterialityInputs {
  const fin = incident.company.financials;
  const d = incident.modelingDefaults;
  return {
    downtimeDays: d?.downtimeDays ?? null,
    recordsMillions: d?.recordsMillions ?? null,
    revenueUSDm: fin?.revenueUSDm ?? null,
    ebitdaUSDm: fin?.ebitdaUSDm ?? null,
    netIncomeUSDm: fin?.netIncomeUSDm ?? null,
    extortionPaymentUSDm: null,
    insuranceOffsetUSDm: null,
  };
}

function getOverride(
  base: MaterialityInputs,
  overrides: MaterialityOverrides | undefined
): MaterialityInputs {
  return {
    downtimeDays: overrides?.downtimeDays ?? base.downtimeDays,
    recordsMillions: overrides?.recordsMillions ?? base.recordsMillions,
    revenueUSDm: overrides?.revenueUSDm ?? base.revenueUSDm,
    ebitdaUSDm: overrides?.ebitdaUSDm ?? base.ebitdaUSDm,
    netIncomeUSDm: overrides?.netIncomeUSDm ?? base.netIncomeUSDm,
    extortionPaymentUSDm:
      overrides?.extortionPaymentUSDm ?? base.extortionPaymentUSDm,
    insuranceOffsetUSDm:
      overrides?.insuranceOffsetUSDm ?? base.insuranceOffsetUSDm,
  };
}

function category(
  categoryKey: MaterialityCategory,
  kind: "primary" | "secondary",
  rangeUSDm: Range3,
  label: string,
  formula: string,
  inputs: Record<string, number | string | null>,
  notes?: string[],
  analysis?: { hint?: string; controlQuestions?: string[] }
): CategoryEstimate {
  return {
    category: categoryKey,
    kind,
    rangeUSDm: clampRange({
      min: usdMillions(rangeUSDm.min),
      mostLikely: usdMillions(rangeUSDm.mostLikely),
      max: usdMillions(rangeUSDm.max),
    }),
    provenance: {
      label,
      formula,
      inputs,
      notes,
      analysisHint: analysis?.hint,
      controlQuestions: analysis?.controlQuestions,
    },
  };
}

export function computeMateriality(
  incident: Incident,
  overrides?: MaterialityOverrides
): { inputs: MaterialityInputs; outputs: MaterialityOutputs } {
  const baseInputs = deriveInputs(incident);
  const inputs = getOverride(baseInputs, overrides);

  const revenuePerDayUSDm =
    inputs.revenueUSDm != null ? inputs.revenueUSDm / 365 : null;
  const contributionMargin =
    inputs.revenueUSDm != null &&
    inputs.revenueUSDm > 0 &&
    inputs.ebitdaUSDm != null
      ? Math.min(0.6, Math.max(0.05, inputs.ebitdaUSDm / inputs.revenueUSDm))
      : 0.25;
  const downtimeDays = inputs.downtimeDays ?? 0;
  const recordsMillions = inputs.recordsMillions ?? 0;

  const biRaw =
    revenuePerDayUSDm != null
      ? revenuePerDayUSDm * downtimeDays * contributionMargin
      : 0;
  const bi = { min: biRaw * 0.6, mostLikely: biRaw * 1.0, max: biRaw * 1.8 };

  const privacyCostPerMillionUSDm = 2.4;
  const privacyRaw = recordsMillions * privacyCostPerMillionUSDm;
  const privacy = {
    min: privacyRaw * 0.4,
    mostLikely: privacyRaw * 1.0,
    max: privacyRaw * 2.2,
  };

  const netSecBase =
    inputs.revenueUSDm != null
      ? Math.max(1.5, inputs.revenueUSDm * 0.00015)
      : 1.5;
  const netSec = {
    min: netSecBase * 0.7,
    mostLikely: netSecBase * 1.0,
    max: netSecBase * 1.8,
  };

  const reputBase =
    inputs.revenueUSDm != null ? inputs.revenueUSDm * 0.002 : 0.8;
  const reput = {
    min: reputBase * 0.4,
    mostLikely: reputBase * 1.0,
    max: reputBase * 2.0,
  };

  const extortionBase = Math.max(0, inputs.extortionPaymentUSDm ?? 0);
  const extortion = {
    min: extortionBase * 0.8,
    mostLikely: extortionBase,
    max: extortionBase * 1.2,
  };

  const categories: CategoryEstimate[] = [
    category(
      "information_privacy",
      "primary",
      privacy,
      "Information Privacy (quantitative)",
      "recordsMillions * costPerMillionUSDm, then apply uncertainty multipliers.",
      {
        recordsMillions: inputs.recordsMillions,
        costPerMillionUSDm: privacyCostPerMillionUSDm,
        minMultiplier: 0.4,
        mostLikelyMultiplier: 1.0,
        maxMultiplier: 2.2,
      },
      ["Tighten with cited record counts and sector cost curves."],
      {
        hint: "This bucket combines the direct work of investigating affected data, notification and consumer support. Regulatory action and litigation belong in conditional external-reaction loss when they are not yet known.",
        controlQuestions: [
          "Loss-event: strong identity, entitlement reviews, and DLP/egress controls on sensitive data stores.",
          "Variance management: vulnerability and exposure management for apps touching PII/PHI/PCI.",
          "Decision support: data inventory, classification, and retention policies so scope of loss is knowable.",
        ],
      }
    ),
    category(
      "business_interruption",
      "primary",
      bi,
      "Business Interruption (quantitative)",
      "revenueUSDm/365 * downtimeDays * contributionMargin, then apply uncertainty multipliers.",
      {
        revenueUSDm: inputs.revenueUSDm,
        revenuePerDayUSDm,
        downtimeDays: inputs.downtimeDays,
        contributionMargin,
        minMultiplier: 0.6,
        mostLikelyMultiplier: 1.0,
        maxMultiplier: 1.8,
      },
      [
        "Downtime should be evidenced in company or regulator artifacts.",
        inputs.ebitdaUSDm == null
          ? "Contribution margin defaults to 25% because EBITDA was unavailable."
          : "Contribution margin uses EBITDA/revenue, bounded to 5%–60% for this teaching model.",
      ],
      {
        hint: "Interruption measures estimated lost margin during degraded operations, not gross revenue delayed. Extraordinary recovery expense remains in response and remediation.",
        controlQuestions: [
          "Loss-event: resilient architecture, failover, and ransomware-resistant backups restore availability.",
          "Variance management: patch and change discipline on OT/IT dependencies that cause cascading outages.",
          "Decision support: BIA/RTO targets and tabletop exercises so downtime estimates are defensible to leadership and auditors.",
        ],
      }
    ),
    category(
      "network_security",
      "primary",
      netSec,
      "Response & Remediation (quantitative stub)",
      "max(1.5, revenueUSDm*0.00015) then apply uncertainty multipliers.",
      {
        revenueUSDm: inputs.revenueUSDm,
        baseUSDm: netSecBase,
        minMultiplier: 0.7,
        mostLikelyMultiplier: 1.0,
        maxMultiplier: 1.8,
      },
      undefined,
      {
        hint: "A collapsed estimate for forensics, containment, restoration and extraordinary technology or professional-services expense. Avoid double counting costs already included in interruption.",
        controlQuestions: [
          "Loss-event: EDR, SOC coverage, and containment playbooks that shorten dwell time.",
          "Variance management: logging completeness and log integrity so investigations are cheaper and faster.",
          "Decision support: asset inventory and CMDB accuracy so IR scopes the right systems first.",
        ],
      }
    ),
    category(
      "cyber_extortion",
      "primary",
      extortion,
      "Cyber Extortion (if any)",
      "entered payment or scenario assumption * uncertainty multipliers.",
      {
        extortionPaymentUSDm: inputs.extortionPaymentUSDm,
        minMultiplier: 0.8,
        mostLikelyMultiplier: 1,
        maxMultiplier: 1.2,
      },
      [
        "Keep a demand, an actual payment and recovery expense distinct. Enter zero when no paid or assumed amount is supported.",
      ],
      {
        hint: "Keep a payment or demand separate from negotiator, legal and recovery costs. A demand is not a paid loss; use zero until evidence supports an amount or scenario assumption.",
        controlQuestions: [
          "Loss-event: offline backups and restoration paths that reduce need to pay; segmentation to limit encryption blast radius.",
          "Variance management: email and endpoint controls that block initial access for ransomware affiliates.",
          "Decision support: pre-legal review of payment policy and law-enforcement coordination paths.",
        ],
      }
    ),
    category(
      "reputational_damage",
      "secondary",
      reput,
      "External reaction loss (conditional proxy)",
      "revenueUSDm * 0.002, then apply uncertainty multipliers.",
      {
        revenueUSDm: inputs.revenueUSDm,
        baseMultiplier: 0.002,
        minMultiplier: 0.4,
        mostLikelyMultiplier: 1.0,
        maxMultiplier: 2.0,
      },
      [
        "This is conditional magnitude. Simulation applies a separate secondary-event probability.",
      ],
      {
        hint: "Conditional loss caused by outside-party reaction, such as customer attrition, litigation or regulatory action. Its occurrence probability is modeled separately in Simulation.",
        controlQuestions: [
          "Loss-event: customer trust controls (fraud prevention, transparency in comms) after breach.",
          "Variance management: monitoring for abnormal churn or discounting tied to incident windows.",
          "Decision support: crisis comms and investor-relations rehearsals tied to materiality thresholds.",
        ],
      }
    ),
  ];

  const primaryTotal = categories
    .filter((c) => c.kind === "primary")
    .reduce((acc, c) => sumRanges(acc, c.rangeUSDm), {
      min: 0,
      mostLikely: 0,
      max: 0,
    });
  const secondaryTotal = categories
    .filter((c) => c.kind === "secondary")
    .reduce((acc, c) => sumRanges(acc, c.rangeUSDm), {
      min: 0,
      mostLikely: 0,
      max: 0,
    });

  const insuranceOffset = inputs.insuranceOffsetUSDm ?? 0;
  const primaryTotalAdj = clampRange({
    min: primaryTotal.min - insuranceOffset,
    mostLikely: primaryTotal.mostLikely - insuranceOffset,
    max: primaryTotal.max - insuranceOffset,
  });

  const confidenceLabel =
    overrides?.confidenceLabel ??
    (inputs.revenueUSDm == null ? "Low" : "Medium");

  return {
    inputs,
    outputs: {
      grossPrimaryTotalUSDm: primaryTotal,
      primaryTotalUSDm: primaryTotalAdj,
      secondaryTotalUSDm: secondaryTotal,
      categories,
      confidenceLabel,
    },
  };
}
