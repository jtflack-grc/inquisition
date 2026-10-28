import { type ReproducibleRiskSimulation } from "../inquisition/lossExceedance";
import type { AppliedTefCalibration } from "../inquisition/tefCalibration";

export function FairFrequencySourceFacts({
  risk,
  calibration,
}: {
  risk: ReproducibleRiskSimulation;
  calibration: AppliedTefCalibration | null;
}) {
  return (
    <section className="space-y-2 border border-war-border/60 bg-[#0d1115] px-3 py-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold text-war-white">
          Frequency · Source facts
        </h3>
        <span className="font-mono text-[9px] uppercase tracking-wide text-amber-200/90">
          {calibration
            ? "External TEF + elicited susceptibility"
            : "Assumption · not measured"}
        </span>
      </header>
      <div className="grid grid-cols-2 gap-3 text-[10px]">
        <div>
          <div className="text-war-muted">Assumed LEF</div>
          <div className="font-mono text-base text-war-white">
            {risk.lefAnnual.toFixed(2)} / year
          </div>
        </div>
        <div>
          <div className="text-war-muted">Chance of ≥1 event in 12 months</div>
          <div className="font-mono text-base text-war-white">
            {(risk.chanceAtLeastOneEvent * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-war-muted">
        {calibration
          ? "This is a present-day hypothetical analogue using imported TEF and independently elicited susceptibility, not an estimate of this historical case's past frequency."
          : "This is a user-entered hypothetical loss-event rate. The 34 selected historical incidents do not provide a frequency denominator."}
      </p>
      <details className="border-t border-war-border/45 pt-2 text-[10px] text-war-muted">
        <summary className="cursor-pointer font-medium text-[#a5c3d3]">
          Inspect frequency assumptions and methodology
        </summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p>
            <strong className="text-war-white">Input:</strong>{" "}
            {calibration
              ? `External ${calibration.estimate.scenario} report (dated ${calibration.estimate.estimateDate}), ${calibration.estimate.profile}. Its positioned median TEF is ${calibration.estimate.positionedTefMedian.toFixed(3)}/year. Per-vector susceptibility is an independent analyst assumption, not from that TEF report.`
              : "User-entered hypothetical LEF, default 1.00/year, bounded 0–10; no observed attack denominator or calibrated susceptibility is supplied."}
          </p>
          <p>
            <strong className="text-war-white">Assumptions:</strong> P(≥1) = 1 −
            exp(−LEF), assuming independent constant-rate Poisson events.
            Expected annual loss = mean conditional event loss × LEF. Per-event
            P90 × LEF is not an annual aggregate percentile.
          </p>
          <p>
            <strong className="text-war-white">
              External methodology and input status:
            </strong>{" "}
            <a
              className="text-[#a5c3d3] underline underline-offset-2"
              href="https://github.com/security-decision-science/security-decision-labs/tree/main/tools/tef-estimator"
              target="_blank"
              rel="noreferrer noopener"
            >
              Laura Voicu &amp; Jack Jones · TEF Estimator 1.3.0
            </a>{" "}
            documents attempted threat events by vector.{" "}
            {calibration
              ? "A user-provided report has been imported for a present-day analogue, but its library and code remain external, and neither susceptibility nor annual dispersion has been calibrated here."
              : "No external report, estimator code, or source data has been incorporated. Historical cases are not assigned contemporary TEF estimates."}
          </p>
        </div>
      </details>
    </section>
  );
}
