/**
 * Source: Cyentia Institute, IRIS Xtreme 2026 (2025-adjusted USD), pages 2–36.
 * https://www.cyentia.com/wp-content/uploads/2026/10/IRIS2026-Xtreme.pdf
 * Tables are paraphrased small extracts for context, not a licensed incident-level dataset.
 * Table 1 below reproduces IRIS 2025 overall-incident figures as quoted by Xtreme 2026.
 */
export const IRIS_XTREME_2026 = {
  sourceUrl:
    "https://www.cyentia.com/wp-content/uploads/2026/10/IRIS2026-Xtreme.pdf",
  publicationUrl: "https://www.cyentia.com/publication/iris-xtreme-2026/",
  publisher: "Cyentia Institute",
  edition: "2026 IRIS Xtreme",
  sampleCount: 136,
  sampleReportedLossUSDm: 26400,
  sampleMedianUSDm: 100,
  selectionThresholdUSDm: 32,
  allIncidentTimeTrendP95USDm: 281.3,
  extremeDisruptionPct: 43.1,
  allIncidentDisruptionPct: 7.8,
  extremeSupplyChainImpactPct: 46.4,
  extremeValidAccountPct: 58.1,
  extremeKnownCvePct: 18,
} as const;

export type RevenueBenchmark = {
  label: string;
  p50USDm: number;
  p95USDm: number;
  population: string;
  sourcePage: number;
};

/** NOT the 136 extreme cases. Table 1 cites Cyentia IRIS 2025 overall incidents. */
export function irisRevenueBenchmark(
  revenueUSDm: number | null
): RevenueBenchmark | null {
  if (revenueUSDm === null || !Number.isFinite(revenueUSDm) || revenueUSDm <= 0)
    return null;
  const common = {
    population: "IRIS 2025 all-incident reported loss sample",
    sourcePage: 5,
  };
  if (revenueUSDm < 100)
    return { label: "Under $100M", p50USDm: 0.357, p95USDm: 9.1, ...common };
  if (revenueUSDm < 1000)
    return { label: "$100M–$1B", p50USDm: 0.4667, p95USDm: 12.3, ...common };
  if (revenueUSDm <= 10000)
    return { label: "$1B–$10B", p50USDm: 1.8, p95USDm: 61.8, ...common };
  return { label: "Above $10B", p50USDm: 2.2, p95USDm: 266.2, ...common };
}

export function irisResearchPrompts(
  tags: string[]
): { title: string; body: string; page: number }[] {
  const set = new Set(tags);
  const prompts: { title: string; body: string; page: number }[] = [];
  if (
    set.has("outage") ||
    set.has("business_interruption") ||
    set.has("manufacturing")
  ) {
    prompts.push({
      title: "Disruption versus breach counts",
      body: "Disruption was the primary outcome in 43.1% of the extreme sample versus 7.8% of the broader incident mix (Figure 9). This is a cross-sample composition comparison, not an event probability for this company.",
      page: 14,
    });
  }
  if (set.has("supply_chain") || set.has("third_party") || set.has("cloud")) {
    prompts.push({
      title: "Third-party dependency boundaries",
      body: "46.4% of the extreme sample showed supply-chain impacts (Figure 13). The statistic neither quantifies this case's downstream losses nor sets the secondary-loss probability slider.",
      page: 21,
    });
  }
  if (set.has("credentials") || set.has("social_engineering")) {
    prompts.push({
      title: "Valid accounts and overlapping vectors",
      body: "Valid accounts were associated with 58.1% of extreme events and 91% of their losses (Table 3). Initial-access techniques overlap: event shares must not be added together or applied as the probability for this case.",
      page: 30,
    });
  }
  if (set.has("data_exfiltration") || set.has("privacy") || set.has("pii")) {
    prompts.push({
      title: "Record count is not total loss",
      body: "Figure 11 finds little relationship between stolen record counts and reported total losses in the studied non-crypto extreme events. Do not use a flat cost-per-record estimate as a predictor of overall incident severity.",
      page: 17,
    });
  }
  if (set.has("financial_theft") || set.has("crypto")) {
    prompts.push({
      title: "Stolen assets versus enterprise costs",
      body: "The report separates crypto theft from non-crypto loss types. Direct asset theft, customer restitution, enterprise response expense and revenue effects have different accounting and loss-bearing boundaries.",
      page: 18,
    });
  }
  return prompts.length
    ? prompts.slice(0, 2)
    : [
        {
          title: "Selection bias and comparability",
          body: "The 136 extreme incidents are a selected financial-loss tail, not a representative incident frequency sample. This historical case was not verified as part of Cyentia's underlying data.",
          page: 2,
        },
      ];
}
