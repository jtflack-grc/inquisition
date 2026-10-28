/**
 * A narrow adapter for user-provided JSON emitted by the separately licensed
 * Voicu/Jones TEF Estimator. No source code, datasets or fitted parameters from
 * that application are bundled in INQUISITION.
 *
 * The source's vector medians are pre-dampening estimates and need not add to
 * its positioned total TEF. We use them ONLY as relative shares before applying
 * the source's positioned overall median and separately elicited susceptibility.
 */
export type TefVector = {
  name: string;
  rawPositionedMedian: number;
  shareOfRawVectors: number;
};

export type TefImport = {
  scenario: string;
  profile: string;
  estimateDate: string;
  inputs: string[];
  positionedTefMedian: number;
  vectors: TefVector[];
};

export type AppliedTefCalibration = {
  estimate: TefImport;
  susceptibilityPct: number[];
  derivedLefAnnual: number;
  acknowledgedPresentDayAnalogy: true;
  source: "user-imported-voicu-jones-tef-json";
};

type RecordData = Record<string, unknown>;

function record(value: unknown): RecordData | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordData)
    : null;
}

function rate(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function parseTefEstimateJson(
  input: string
): { ok: true; estimate: TefImport } | { ok: false; error: string } {
  if (input.length > 250_000)
    return { ok: false, error: "Report exceeds the 250 KB paste limit." };
  let json: unknown;
  try {
    json = JSON.parse(input);
  } catch {
    return { ok: false, error: "Paste valid JSON from tef-estimator estimate --json." };
  }
  const root = record(json);
  const summary = record(root?.summary);
  const analysis = record(root?.analysis);
  if (!root || !summary || !analysis)
    return {
      ok: false,
      error: "Expected a single TEF Estimator estimate JSON with summary and analysis (not a compare response).",
    };
  const positionedTefMedian = rate(summary.positioned_median);
  if (positionedTefMedian === null || positionedTefMedian > 1_000_000)
    return { ok: false, error: "Missing or invalid summary.positioned_median annual TEF." };
  const scenario = root.scenario;
  const profile = root.profile;
  const estimateDate = root.estimate_date;
  if (
    typeof scenario !== "string" ||
    typeof profile !== "string" ||
    typeof estimateDate !== "string" ||
    !/^\\d{4}-\\d{2}-\\d{2}$/.test(estimateDate)
  )
    return {
      ok: false,
      error: "Missing scenario, organization profile, or ISO estimate date.",
    };
  if (!Array.isArray(analysis.vectors) || analysis.vectors.length === 0 || analysis.vectors.length > 20)
    return { ok: false, error: "Expected 1–20 access vectors in analysis.vectors." };
  const raw: Array<{ name: string; value: number }> = [];
  for (const value of analysis.vectors) {
    const vector = record(value);
    const median = rate(vector?.positioned_median);
    if (median === null || typeof vector?.name !== "string" || !vector.name.trim())
      return { ok: false, error: "Each access vector needs a name and nonnegative positioned_median." };
    raw.push({ name: vector.name.trim().slice(0, 90), value: median });
  }
  const sum = raw.reduce((acc, entry) => acc + entry.value, 0);
  if (sum <= 0 && positionedTefMedian > 0)
    return { ok: false, error: "Nonzero overall TEF requires positive vector frequencies." };
  const rawInputs = root.inputs;
  return {
    ok: true,
    estimate: {
      scenario: scenario.slice(0, 100),
      profile: profile.slice(0, 500),
      estimateDate,
      positionedTefMedian,
      inputs: Array.isArray(rawInputs)
        ? rawInputs.filter((v): v is string => typeof v === "string").slice(0, 30).map(v => v.slice(0, 300))
        : [],
      vectors: raw.map(({ name, value }) => ({
        name,
        rawPositionedMedian: value,
        shareOfRawVectors: sum > 0 ? value / sum : 0,
      })),
    },
  };
}

/** Requires an explicit, complete and independently assessed susceptibility per vector. */
export function deriveLefFromTef(
  estimate: TefImport,
  susceptibilityPct: (number | null)[]
): number | null {
  if (susceptibilityPct.length !== estimate.vectors.length) return null;
  if (
    susceptibilityPct.some(
      (v) => v === null || !Number.isFinite(v) || v < 0 || v > 100
    )
  )
    return null;
  const weighted = estimate.vectors.reduce(
    (sum, vector, i) =>
      sum + vector.shareOfRawVectors * (susceptibilityPct[i]! / 100),
    0
  );
  return estimate.positionedTefMedian * weighted;
}
