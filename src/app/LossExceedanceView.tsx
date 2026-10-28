import { useState } from "react";
import {
  annualChanceOfOneExceedingEvent,
  type ReproducibleRiskSimulation,
} from "../inquisition/lossExceedance";
import { EduTooltip } from "./EduTooltip";

/** A conditional ONE-EVENT loss curve. Never reuse as an annual aggregate curve. */
export function LossExceedanceView({
  risk,
}: {
  risk: ReproducibleRiskSimulation;
}) {
  const [index, setIndex] = useState(20);
  const point = risk.perEventExceedance[index];
  const annualChance = annualChanceOfOneExceedingEvent(
    risk.lefAnnual,
    point?.probability ?? 0
  );
  const path = risk.perEventExceedance
    .map((row, i) => `${42 + i * 13.5},${139 - row.probability * 118}`)
    .join(" ");

  return (
    <section className="space-y-3 border border-war-border/60 bg-[#0d1115] px-3 py-3">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold text-war-white">
          Conditional loss exceedance · one event
        </h3>
        <EduTooltip
          title="Read a conditional exceedance curve"
          body="Each point shows the proportion of individual simulated loss events that exceed a dollar threshold. This is conditional on the modeled loss event having occurred, not an annual probability, forecast or statistical confidence interval. The annual chance beside it uses a separate hypothetical LEF and Poisson-thinning assumption."
          badge="FAIR"
        />
      </div>
      <svg
        viewBox="0 0 500 168"
        className="block w-full"
        role="img"
        aria-label="Conditional probability one modeled loss event exceeds each dollar threshold"
      >
        <line x1="42" y1="21" x2="474" y2="21" stroke="#283039" />
        <line x1="42" y1="80" x2="474" y2="80" stroke="#283039" />
        <line x1="42" y1="139" x2="474" y2="139" stroke="#50606a" />
        <text x="2" y="25" fill="#8b949e" fontSize="10">
          100%
        </text>
        <text x="10" y="84" fill="#8b949e" fontSize="10">
          50%
        </text>
        <text x="18" y="143" fill="#8b949e" fontSize="10">
          0%
        </text>
        <polyline
          points={path}
          fill="none"
          stroke="#7ea4bf"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {point && (
          <>
            <line
              x1={42 + index * 13.5}
              y1="21"
              x2={42 + index * 13.5}
              y2="139"
              stroke="#c89a55"
              strokeDasharray="3 4"
            />
            <circle
              cx={42 + index * 13.5}
              cy={139 - point.probability * 118}
              r="4"
              fill="#eac58a"
            />
          </>
        )}
        <text x="42" y="160" fill="#8b949e" fontSize="10">
          $0M
        </text>
        <text x="474" y="160" fill="#8b949e" fontSize="10" textAnchor="end">
          $${risk.perEventExceedance[32]?.thresholdUSDm.toFixed(1) ?? "0"}M
        </text>
      </svg>
      <label className="block space-y-2 text-[10px] text-war-muted">
        <span>Interrogate a loss threshold</span>
        <input
          type="range"
          min={0}
          max={32}
          step={1}
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          className="w-full accent-amber-400"
        />
      </label>
      <div className="grid grid-cols-1 gap-3 border-t border-war-border/50 pt-3 sm:grid-cols-3">
        <div>
          <div className="text-[10px] text-war-muted">Chosen threshold</div>
          <div className="font-mono text-sm text-war-white">
            $${point?.thresholdUSDm.toFixed(2) ?? "0"}M
          </div>
        </div>
        <div>
          <div className="text-[10px] text-war-muted">
            P(event loss &gt; threshold)
          </div>
          <div className="font-mono text-sm text-war-white">
            {((point?.probability ?? 0) * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] text-war-muted">
            P(≥1 exceeding event in 12 months)
          </div>
          <div className="font-mono text-sm text-war-white">
            {(annualChance * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      <p className="text-[9px] leading-relaxed text-war-muted">
        Curve: retained loss from one realized event. Annual probability:
        independent Poisson events with the assumed LEF and independent
        severity. Neither infers frequency from the selected historical case.
      </p>
    </section>
  );
}
