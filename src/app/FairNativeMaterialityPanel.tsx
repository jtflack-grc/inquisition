import { useMemo } from "react";
import {
  type LmStatBlock,
} from "../inquisition/fairLmMonteCarlo";
import type { CategoryEstimate } from "../inquisition/types";
import { runReproducibleRiskSimulation } from "../inquisition/lossExceedance";
import { FairFrequencySourceFacts } from "./FairFrequencySourceFacts";
import { LossExceedanceView } from "./LossExceedanceView";
import { AnnualExposureView } from "./AnnualExposureView";
import { EduTooltip } from "./EduTooltip";
import { FairNativeReferenceSections } from "./FairNativeReferenceSections";

function formatStatM(s: LmStatBlock): string {
  return `P10 $${s.p10.toFixed(1)}M · P50 $${s.p50.toFixed(1)}M · P90 $${s.p90.toFixed(1)}M (mean $${s.mean.toFixed(1)}M)`;
}

export type FairNativeMaterialityPanelProps = {
  categories: CategoryEstimate[];
  insuranceOffsetUSDm: number;
  iterations: number;
  onIterationsChange: (n: number) => void;
  /** Loss event frequency (events / year) for optional EAL line — LM stays conditional on “this scenario.” */
  lefAnnual: number;
  onLefAnnualChange: (v: number) => void;
  secondaryEventProbabilityPct: number;
  simulationSeed: number;
  onSecondaryEventProbabilityPctChange: (v: number) => void;
};

export function FairNativeMaterialityPanel({
  categories,
  insuranceOffsetUSDm,
  iterations,
  onIterationsChange,
  lefAnnual,
  onLefAnnualChange,
  secondaryEventProbabilityPct,
  onSecondaryEventProbabilityPctChange,
  simulationSeed,
}: FairNativeMaterialityPanelProps) {
  const risk = useMemo(
    () =>
      runReproducibleRiskSimulation({
        categories,
        insuranceOffsetUSDm,
        iterations,
        secondaryEventProbability: secondaryEventProbabilityPct / 100,
        lefAnnual,
        seed: simulationSeed,
      }),
    [
      categories,
      insuranceOffsetUSDm,
      iterations,
      secondaryEventProbabilityPct,
      lefAnnual,
      simulationSeed,
    ]
  );
  const mc = risk.perEvent;

  return (
    <section className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-950/25 to-black/70 px-4 py-4 space-y-4">
      <header className="space-y-2 border-b border-war-border/40 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-amber-200/95">
            Simulation / loss magnitude
          </h2>
          <EduTooltip
            title="What this simulation is (and isn’t)"
            body="Uses FAIR vocabulary for Loss Magnitude (LM) and optional Loss Event Frequency (LEF) exposure. Monte Carlo draws independent triangular distributions per cost bucket from the same min/mode/max as the deterministic bridge—correlation and full FAIR factor trees are not modeled. Not FAIR Institute–certified software; for decision-grade FAIR work use qualified practitioners and official materials."
            badge="FAIR"
          />
        </div>
        <p className="text-[10px] text-slate-200 leading-relaxed">
          Core FAIR concepts organize loss magnitude, event frequency and
          conditional secondary loss. The incident-cost categories are
          INQUISITION’s own transparent teaching taxonomy.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
        <label className="flex flex-col gap-1">
          <span className="text-war-muted flex items-center gap-1">
            Monte Carlo iterations
            <EduTooltip
              title="Iterations"
              body="More iterations stabilize percentile estimates; 2k is usually enough for demos, 10–25k for smoother tails."
              badge="CRQ"
            />
          </span>
          <select
            value={iterations}
            onChange={(e) => onIterationsChange(Number(e.target.value))}
            className="rounded-lg bg-black/60 border border-amber-500/35 px-2 py-2 text-war-white"
          >
            {[2000, 10000, 25000].map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString()}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-war-muted flex items-center gap-1">
            Secondary event chance
            <EduTooltip
              title="Secondary loss event probability"
              body="The conditional chance that outside parties react to this primary event in a way that creates additional loss, such as litigation, regulatory action or customer attrition."
              badge="FAIR"
            />
          </span>
          <div className="flex min-h-[38px] items-center gap-2 rounded-lg border border-amber-500/35 bg-black/60 px-2">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={secondaryEventProbabilityPct}
              onChange={(e) =>
                onSecondaryEventProbabilityPctChange(Number(e.target.value))
              }
              className="min-w-0 flex-1 accent-amber-400"
            />
            <span className="w-9 text-right font-mono text-amber-100">
              {secondaryEventProbabilityPct}%
            </span>
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-war-muted flex items-center gap-1">
            LEF — loss events / year
            <EduTooltip
              title="Loss Event Frequency (LEF)"
              body="This user-entered loss-event rate is hypothetical, not inferred from the historical case. TEF means attempted threat events; deriving LEF requires scenario-specific susceptibility. The initial value of 1/year is not empirically calibrated."
              badge="FAIR"
            />
          </span>
          <input
            type="number"
            min={0}
            max={10}
            step={0.05}
            value={Number.isFinite(lefAnnual) ? lefAnnual : 0}
            onChange={(e) =>
              onLefAnnualChange(
                Math.max(0, Math.min(10, Number(e.target.value)))
              )
            }
            className="rounded-lg bg-black/60 border border-amber-500/35 px-2 py-2 text-war-white"
          />
        </label>
      </div>

      <FairFrequencySourceFacts risk={risk} />

      <div className="rounded-lg border border-war-border/50 bg-black/45 px-3 py-3 space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/90">
          Loss magnitude (LM) — simulation
        </h3>
        <p className="text-[9px] text-slate-200/95 leading-relaxed">
          Each category row is sampled as{" "}
          <strong className="text-white">triangular(min, mode, max)</strong>{" "}
          from the bridge. Cost buckets are{" "}
          <strong className="text-white">independent</strong>. Secondary loss is
          included only when the conditional outside-party reaction occurs.
        </p>
        <ul className="space-y-2 text-[10px] text-slate-200 leading-relaxed">
          <li>
            <span className="text-white font-medium">
              Gross primary LM (USD M):{" "}
            </span>
            {formatStatM(mc.grossPrimaryLmUsdM)}
          </li>
          <li>
            <span className="text-white font-medium">
              Retained primary LM (USD M):{" "}
            </span>
            {formatStatM(mc.primaryLmUsdM)}
          </li>
          <li>
            <span className="text-white font-medium">
              Secondary LM (USD M):{" "}
            </span>
            {formatStatM(mc.secondaryLmUsdM)}
          </li>
          <li>
            <span className="text-white font-medium">
              Retained total LM (USD M):{" "}
            </span>
            {formatStatM(mc.totalLmUsdM)}
          </li>
        </ul>
        {insuranceOffsetUSDm > 0 && (
          <p className="text-[9px] text-slate-400">
            Retained values subtract up to ${insuranceOffsetUSDm.toFixed(1)}M of
            assumed insurance recovery from each simulated primary-loss outcome.
          </p>
        )}
      </div>

      <LossExceedanceView risk={risk} />

      <AnnualExposureView risk={risk} />

      <FairNativeReferenceSections />
    </section>
  );
}
