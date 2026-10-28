import type { ReproducibleRiskSimulation } from "../inquisition/lossExceedance";
import { EduTooltip } from "./EduTooltip";

export function AnnualExposureView({
  risk,
}: {
  risk: ReproducibleRiskSimulation;
}) {
  const eal = risk.perEvent.totalLmUsdM.mean * risk.lefAnnual;

  return (
    <section className="space-y-2 border border-violet-500/30 bg-black/55 px-3 py-3">
      <div className="flex items-center gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-200">
          Annual exposure · separate from one-event severity
        </h3>
        <EduTooltip
          title="Expected annual loss versus annual aggregate percentiles"
          body="EAL is the per-event mean times the hypothetical annual loss-event rate. Annual aggregate P90/P95 are simulated by drawing a Poisson number of events each year and adding independently resampled event losses. They are NOT per-event P90 times LEF. Annual counts and losses are assumptions rather than observed company data."
          badge="FAIR"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <div className="text-[10px] text-war-muted">Expected annual loss</div>
          <div className="font-mono text-base text-war-white">
            $${eal.toFixed(2)}M
          </div>
          <div className="text-[9px] text-war-muted">
            Mean event loss × assumed LEF
          </div>
        </div>
        <div>
          <div className="text-[10px] text-war-muted">Annual aggregate P90</div>
          <div className="font-mono text-base text-war-white">
            $${risk.annualAggregate.p90.toFixed(2)}M
          </div>
          <div className="text-[9px] text-war-muted">
            Sum of simulated losses/year
          </div>
        </div>
        <div>
          <div className="text-[10px] text-war-muted">
            Years without an event
          </div>
          <div className="font-mono text-base text-war-white">
            {(risk.annualAggregate.zeroEventYearShare * 100).toFixed(1)}%
          </div>
          <div className="text-[9px] text-war-muted">
            Monte Carlo event-count outcomes
          </div>
        </div>
      </div>
      <p className="text-[9px] leading-relaxed text-war-muted">
        Annual P95 $${risk.annualAggregate.p95.toFixed(2)}M. This simple
        compound-Poisson sketch assumes independent arrivals, stable exposure
        and independently resampled per-event losses. It excludes campaign
        clustering, shared recovery dependencies, changing susceptibility,
        annual insurance exhaustion and correlated costs.
      </p>
      <div className="border-t border-war-border/40 pt-2 font-mono text-[9px] text-war-muted">
        Reproducibility · seed {risk.seed} · {risk.iterations.toLocaleString()}{" "}
        draws · model {risk.modelVersion}
      </div>
    </section>
  );
}
