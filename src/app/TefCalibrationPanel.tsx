import { useState } from "react";
import {
  deriveLefFromTef,
  parseTefEstimateJson,
  type AppliedTefCalibration,
  type TefImport,
} from "../inquisition/tefCalibration";
import { EduTooltip } from "./EduTooltip";

export function TefCalibrationPanel({
  applied,
  onApply,
  onClear,
}: {
  applied: AppliedTefCalibration | null;
  onApply: (calibration: AppliedTefCalibration) => void;
  onClear: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [estimate, setEstimate] = useState<TefImport | null>(null);
  const [rates, setRates] = useState<(number | null)[]>([]);
  const [acknowledge, setAcknowledge] = useState(false);
  const [error, setError] = useState("");
  const derived = estimate ? deriveLefFromTef(estimate, rates) : null;
  const canApply =
    acknowledge && derived !== null && derived <= 10 && derived >= 0;
  const importJson = () => {
    const result = parseTefEstimateJson(raw);
    if (!result.ok) {
      setError(result.error);
      setEstimate(null);
      return;
    }
    setError("");
    setEstimate(result.estimate);
    setRates(result.estimate.vectors.map(() => null));
    setAcknowledge(false);
  };
  return (
    <section className="space-y-3 border border-war-border/60 bg-[#0d1115] p-3">
      <header className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold text-war-white">
          Optional · TEF-informed prospective analogy
        </h3>
        <EduTooltip
          title="Threat attempts are not loss events"
          body="Paste a TEF Estimator --json output, then provide a separately justified probability of a defined loss event per access vector. INQUISITION applies the source's positioned total TEF to relative vector shares, because its pre-dampening vector frequencies do not necessarily sum to the dampened total. This produces a point-rate scenario, not full FAIR calibration or a historical causal claim."
          badge="FAIR"
        />
      </header>
      <p className="text-[10px] leading-relaxed text-war-muted">
        Import a report generated separately by Laura Voicu and Jack Jones&apos;s{" "}
        <a
          href="https://github.com/security-decision-science/security-decision-labs/tree/main/tools/tef-estimator"
          className="text-[#a5c3d3] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          TEF Estimator
        </a>
        . No bundled data, external requests or copied estimator code. This
        stays in your browser until you explicitly export.
      </p>
      {applied && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-l-2 border-[#64a783] bg-black/50 p-2">
          <p className="text-[10px] text-war-white">
            Applied hypothetical LEF:{" "}
            <span className="font-mono">
              {applied.derivedLefAnnual.toFixed(3)}/year
            </span>
            {" "}· {applied.estimate.scenario} ·{" "}
            {applied.estimate.estimateDate}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="border border-war-border px-2 py-1 text-[10px] text-war-white"
          >
            Return to manual LEF
          </button>
        </div>
      )}
      <details>
        <summary className="cursor-pointer text-[10px] font-medium text-[#a5c3d3]">
          Import estimate and examine susceptibility
        </summary>
        <div className="mt-3 space-y-3">
          <label className="block text-[10px] text-war-muted">
            Paste the result of <code>tef-estimator estimate --json</code>
            <textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              maxLength={250000}
              rows={3}
              spellCheck={false}
              placeholder="Paste JSON with scenario, profile, summary and analysis.vectors"
              className="mt-1 w-full rounded border border-war-border bg-black/70 p-2 font-mono text-[10px] text-war-white"
            />
          </label>
          <button
            type="button"
            onClick={importJson}
            className="border border-[#7ea4bf]/60 px-3 py-1.5 text-[10px] text-war-white"
          >
            Validate local JSON
          </button>
          {error && (
            <p role="alert" className="text-[10px] text-red-300">
              {error}
            </p>
          )}
          {estimate && (
            <div className="space-y-3 border-t border-war-border/60 pt-3">
              <div className="text-[10px] leading-relaxed text-war-muted">
                <p>
                  <span className="text-war-white">Scenario:</span>{" "}
                  {estimate.scenario}
                </p>
                <p>
                  <span className="text-war-white">Profile:</span>{" "}
                  {estimate.profile}
                </p>
                <p>
                  <span className="text-war-white">Estimate date:</span>{" "}
                  {estimate.estimateDate} · positioned TEF{" "}
                  <span className="font-mono text-war-white">
                    {estimate.positionedTefMedian.toFixed(3)}/year
                  </span>
                </p>
              </div>
              <p className="text-[10px] leading-relaxed text-war-muted">
                Enter your own P(loss event | attempt) for every vector.
                These percentages are <strong className="text-war-white">not</strong>{" "}
                provided by the imported report. Unspecified values remain blank,
                not zero. Vector shares are normalized before multiplying by
                the overall positioned TEF to avoid double-counting.
              </p>
              <div className="grid gap-2">
                {estimate.vectors.map((vector, i) => (
                  <label
                    key={i}
                    className="grid grid-cols-[minmax(0,1fr)_100px] items-center gap-3 text-[10px]"
                  >
                    <span className="text-war-white">
                      {vector.name}{" "}
                      <span className="text-war-muted">
                        ({(vector.shareOfRawVectors * 100).toFixed(1)}% relative share)
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={rates[i] ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setRates((prev) =>
                            prev.map((v, idx) =>
                              idx === i
                                ? value === ""
                                  ? null
                                  : Number(value)
                                : v
                            )
                          );
                        }}
                        aria-label={`Susceptibility for ${vector.name} percent`}
                        className="min-w-0 w-full border border-war-border bg-black/70 p-1.5 font-mono text-war-white"
                      />
                      %
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-war-white">
                Derived scenario LEF:{" "}
                <span className="font-mono">
                  {derived === null
                    ? "Awaiting all susceptibility inputs"
                    : `${derived.toFixed(3)}/year`}
                </span>
              </p>
              {derived !== null && derived > 10 && (
                <p role="alert" className="text-[10px] text-amber-200">
                  This rate exceeds INQUISITION&apos;s 10-event/year teaching
                  bound. No frequency has been applied.
                </p>
              )}
              <label className="flex items-start gap-2 text-[10px] leading-relaxed text-war-muted">
                <input
                  type="checkbox"
                  checked={acknowledge}
                  onChange={(event) => setAcknowledge(event.target.checked)}
                  className="mt-0.5 accent-[#64a783]"
                />
                <span>
                  I am deliberately modeling a <strong className="text-war-white">present-day
                  hypothetical analogue</strong>. The imported TEF, profile
                  alignment and my susceptibility estimates do not establish
                  the actual historical incident&apos;s probability or a
                  calibrated loss-event distribution.
                </span>
              </label>
              <button
                type="button"
                disabled={!canApply}
                onClick={() => {
                  if (derived === null || !estimate || !acknowledge) return;
                  onApply({
                    estimate,
                    susceptibilityPct: rates as number[],
                    derivedLefAnnual: derived,
                    acknowledgedPresentDayAnalogy: true,
                    source: "user-imported-voicu-jones-tef-json",
                  });
                }}
                className="border border-[#64a783]/60 px-3 py-2 text-[10px] text-war-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Use derived LEF in illustrative annual simulation
              </button>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
